-- ============================================================
-- MJ NEXUS — Real notifications (SAFE / additive)
-- Run ONCE in Supabase → SQL Editor. Non-destructive.
-- Events (submissions, approvals, certificates...) create a row
-- for the recipient; each user sees & manages only their own.
-- ============================================================

create table if not exists public.notifications (
  id text primary key,
  user_id uuid,
  type text default 'info',
  text text,
  href text,
  read boolean default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Any signed-in user may create a notification for a recipient...
drop policy if exists notif_insert on public.notifications;
create policy notif_insert on public.notifications for insert to authenticated with check (true);
-- ...but only the recipient can read / update / delete their own.
drop policy if exists notif_select on public.notifications;
create policy notif_select on public.notifications for select to authenticated using (auth.uid() = user_id);
drop policy if exists notif_update on public.notifications;
create policy notif_update on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists notif_delete on public.notifications;
create policy notif_delete on public.notifications for delete to authenticated using (auth.uid() = user_id);

do $$
begin
  begin execute 'alter publication supabase_realtime add table public.notifications'; exception when duplicate_object then null; end;
end $$;
