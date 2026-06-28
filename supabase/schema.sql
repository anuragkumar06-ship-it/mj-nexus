-- ============================================================
-- MJ NEXUS — Supabase schema (real + real-time)
-- Run this in Supabase → SQL Editor → New query → Run.
-- Safe to re-run. Then run supabase/seed.sql once for sample data.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Roles + profiles (for login & role) ----------
do $$ begin
  create type mj_role as enum ('intern','lead','hr','management');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text, email text, phone text,
  role mj_role not null default 'intern',
  title text, team text,
  created_at timestamptz not null default now()
);

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
  after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_write on public.profiles;
create policy profiles_write on public.profiles for all to authenticated using (true) with check (true);

-- ---------- Workflow tables (text IDs; the app supplies the id) ----------
drop table if exists public.submissions cascade;
drop table if exists public.tasks cascade;
drop table if exists public.standups cascade;
drop table if exists public.requests cascade;
drop table if exists public.feedback cascade;

create table public.tasks (
  id text primary key,
  title text, description text,
  assignee_id text, assigner_id text,
  team text, status text, priority text, due text, tag text,
  submission_id text,
  created_at timestamptz not null default now()
);

create table public.submissions (
  id text primary key,
  task_id text, intern_id text,
  note text, files jsonb default '[]'::jsonb,
  status text, review_note text,
  submitted_at text,
  created_at timestamptz not null default now()
);

create table public.standups (
  id text primary key,
  intern_id text, completed text, priorities text, challenges text, date text,
  created_at timestamptz not null default now()
);

create table public.requests (
  id text primary key,
  type text, title text, detail text,
  requester_id text, approver_id text, status text,
  files jsonb default '[]'::jsonb, decision_note text, created_at_label text,
  created_at timestamptz not null default now()
);

create table public.feedback (
  id text primary key,
  intern_id text, from_id text, rating int, note text, date text,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security (any signed-in user) ----------
do $$
declare t text;
begin
  foreach t in array array['tasks','submissions','standups','requests','feedback']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I_read on public.%I;', t, t);
    execute format('create policy %I_read on public.%I for select to authenticated using (true);', t, t);
    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format('create policy %I_write on public.%I for all to authenticated using (true) with check (true);', t, t);
  end loop;
end $$;

-- ---------- Enable Realtime on the workflow tables ----------
do $$
declare t text;
begin
  foreach t in array array['tasks','submissions','standups','requests','feedback']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I;', t);
    exception when duplicate_object then null; end;
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
create policy submissions_read on storage.objects for select to public
  using (bucket_id = 'submissions');
