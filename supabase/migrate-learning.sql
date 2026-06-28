-- ============================================================
-- MJ NEXUS — Learning Hub (SAFE / additive)
-- Run ONCE in Supabase → SQL Editor. Non-destructive.
-- learning_resources: videos/materials management & leads add.
-- learning_progress:  per-user progress (each user sees only their own).
-- ============================================================

create table if not exists public.learning_resources (
  id text primary key,
  title text,
  description text,
  type text default 'Video',
  url text,
  category text default 'General',
  level text default 'Beginner',
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  id text primary key,            -- `${user_id}_${resource_id}`
  user_id uuid,
  resource_id text,
  progress int default 0,
  updated_at timestamptz not null default now()
);

-- Resources: any signed-in user can read; signed-in users can write (add materials).
alter table public.learning_resources enable row level security;
drop policy if exists lr_read on public.learning_resources;
create policy lr_read on public.learning_resources for select to authenticated using (true);
drop policy if exists lr_write on public.learning_resources;
create policy lr_write on public.learning_resources for all to authenticated using (true) with check (true);

-- Progress: each user can only see/write their own rows.
alter table public.learning_progress enable row level security;
drop policy if exists lp_all on public.learning_progress;
create policy lp_all on public.learning_progress for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.learning_resources'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.learning_progress'; exception when duplicate_object then null; end;
end $$;
