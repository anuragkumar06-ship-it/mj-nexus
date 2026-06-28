-- ============================================================
-- MJ NEXUS — Per-user upgrade (SAFE / non-destructive)
-- Run this ONCE in Supabase → SQL Editor if you already ran schema.sql before.
-- It only ADDS the new profile columns + realtime; it does NOT delete any data.
-- (If you've never run schema.sql at all, run schema.sql instead.)
-- ============================================================

-- New columns used to build the org (added only if missing)
alter table public.profiles add column if not exists manager_id uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists performance int;
alter table public.profiles add column if not exists reliability int;
alter table public.profiles add column if not exists growth int;
alter table public.profiles add column if not exists attendance int;
alter table public.profiles add column if not exists title text;
alter table public.profiles add column if not exists team text;

-- Make sure profiles are readable/writable by signed-in users (directory + admin)
alter table public.profiles enable row level security;
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_write on public.profiles;
create policy profiles_write on public.profiles for all to authenticated using (true) with check (true);

-- Live updates when roles/teams/managers change
do $$ begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null; end $$;
