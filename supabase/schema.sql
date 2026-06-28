-- ============================================================
-- MJ NEXUS — Supabase schema, RLS & storage
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Roles ----------
do $$ begin
  create type mj_role as enum ('intern','lead','hr','management');
exception when duplicate_object then null; end $$;

-- ---------- Profiles (one row per auth user) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  role mj_role not null default 'intern',
  title text,
  team text,
  manager_id uuid references public.profiles(id),
  performance int, reliability int, growth int, attendance int,
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a user signs up (role defaults to 'intern';
-- update it from the dashboard or SQL to promote leads/HR/management).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Core tables ----------
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null, role text, college text, state text, source text,
  stage text default 'Applied', fit_score int, experience text, skills text[],
  email text, created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text,
  assignee_id uuid references public.profiles(id),
  assigner_id uuid references public.profiles(id),
  team text, status text default 'To Do', priority text default 'Medium',
  due text, tag text, created_at timestamptz default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  intern_id uuid references public.profiles(id),
  note text, files jsonb default '[]', status text default 'Pending Review',
  review_note text, created_at timestamptz default now()
);

create table if not exists public.standups (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid references public.profiles(id),
  completed text, priorities text, challenges text, created_at timestamptz default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  type text, title text, detail text,
  requester_id uuid references public.profiles(id),
  approver_id uuid references public.profiles(id),
  status text default 'Pending', files jsonb default '[]',
  decision_note text, created_at timestamptz default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid references public.profiles(id),
  from_id uuid references public.profiles(id),
  rating int, note text, created_at timestamptz default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  candidate text, role text, date text, time text, interviewer text,
  mode text, status text default 'Upcoming', score int, created_at timestamptz default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  recipient text, type text, role text, issued text,
  status text default 'Draft', score int, created_at timestamptz default now()
);

-- ---------- Row Level Security ----------
alter table public.profiles     enable row level security;
alter table public.candidates   enable row level security;
alter table public.tasks        enable row level security;
alter table public.submissions  enable row level security;
alter table public.standups     enable row level security;
alter table public.requests     enable row level security;
alter table public.feedback     enable row level security;
alter table public.interviews   enable row level security;
alter table public.certificates enable row level security;

-- Helper: current user's role
create or replace function public.my_role() returns mj_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Profiles: everyone authenticated can read the directory; you can edit yourself; management edits anyone.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid() or public.my_role() = 'management');

-- Generic baseline: authenticated users can read; authenticated users can write.
-- Tighten per-table as needed (examples kept permissive for fast setup).
do $$
declare t text;
begin
  foreach t in array array['candidates','tasks','submissions','standups','requests','feedback','interviews','certificates']
  loop
    execute format('drop policy if exists %I_read on public.%I;', t, t);
    execute format('create policy %I_read on public.%I for select to authenticated using (true);', t, t);
    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format('create policy %I_write on public.%I for all to authenticated using (true) with check (true);', t, t);
  end loop;
end $$;

-- ---------- Storage: proof-of-work uploads ----------
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do nothing;

drop policy if exists submissions_upload on storage.objects;
create policy submissions_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions');
drop policy if exists submissions_read on storage.objects;
create policy submissions_read on storage.objects for select to authenticated
  using (bucket_id = 'submissions');
