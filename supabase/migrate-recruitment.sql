-- ============================================================
-- MJ NEXUS — Recruitment tables (SAFE / additive)
-- Run ONCE in Supabase → SQL Editor. Non-destructive (create if not exists).
-- ============================================================

create table if not exists public.candidates (
  id text primary key,
  name text, role text, college text, state text, source text,
  stage text default 'Applied', fit_score int, experience text,
  skills text[] default '{}', email text,
  created_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id text primary key,
  candidate text, role text, date text, time text, interviewer text,
  mode text, status text default 'Upcoming', score int,
  created_at timestamptz not null default now()
);

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
