-- ============================================================
-- MJ NEXUS — Attendance (SAFE / additive)
-- Run ONCE in Supabase → SQL Editor. Non-destructive.
-- Each person marks their own attendance; everyone in the org
-- can view (so leads/HR/management see team attendance).
-- ============================================================

create table if not exists public.attendance (
  id text primary key,            -- `${user_id}_${date}`
  user_id uuid,
  date text,                      -- YYYY-MM-DD
  status text default 'Present',
  check_in text,
  created_at timestamptz not null default now()
);

alter table public.attendance enable row level security;

drop policy if exists att_read on public.attendance;
create policy att_read on public.attendance for select to authenticated using (true);
drop policy if exists att_write on public.attendance;
create policy att_write on public.attendance for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
begin
  begin execute 'alter publication supabase_realtime add table public.attendance'; exception when duplicate_object then null; end;
end $$;
