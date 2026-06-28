-- ============================================================
-- MJ NEXUS — Announcements (SAFE / additive)
-- Run ONCE in Supabase → SQL Editor. Non-destructive.
-- Management broadcasts that everyone in the org sees.
-- ============================================================

create table if not exists public.announcements (
  id text primary key,
  title text,
  body text,
  author_id text,
  author_name text,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;
drop policy if exists ann_read on public.announcements;
create policy ann_read on public.announcements for select to authenticated using (true);
drop policy if exists ann_write on public.announcements;
create policy ann_write on public.announcements for all to authenticated using (true) with check (true);

do $$
begin
  begin execute 'alter publication supabase_realtime add table public.announcements'; exception when duplicate_object then null; end;
end $$;
