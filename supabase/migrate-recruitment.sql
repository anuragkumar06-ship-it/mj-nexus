-- ============================================================
-- MJ NEXUS — Recruitment tables (SAFE / additive)
-- Run ONCE in Supabase → SQL Editor. Non-destructive (create if not exists).
-- ============================================================

create table if not exists public.candidates (
  id text primary key,
  name text, role text, college text, state text, source text,
  stage text default 'Applied', fit_score int, experience text,
  skills text[] default '{}', email text,
  resume_url text, resume_name text,
  intern_start text, intern_end text,
  created_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id text primary key,
  candidate text, role text, date text, time text, interviewer text,
  mode text, status text default 'Upcoming', score int,
  created_at timestamptz not null default now()
);

-- Resume/CV + internship duration columns (safe to re-run on an existing table)
alter table public.candidates add column if not exists resume_url text;
alter table public.candidates add column if not exists resume_name text;
alter table public.candidates add column if not exists intern_start text;
alter table public.candidates add column if not exists intern_end text;

-- RLS: any signed-in user can read/write recruitment data
do $$
declare t text;
begin
  foreach t in array array['candidates','interviews']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I_read on public.%I;', t, t);
    execute format('create policy %I_read on public.%I for select to authenticated using (true);', t, t);
    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format('create policy %I_write on public.%I for all to authenticated using (true) with check (true);', t, t);
    begin
      execute format('alter publication supabase_realtime add table public.%I;', t);
    exception when duplicate_object then null; end;
  end loop;
end $$;
