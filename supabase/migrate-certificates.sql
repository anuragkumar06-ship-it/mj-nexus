-- ============================================================
-- MJ NEXUS — Certificates (SAFE / additive)
-- Run ONCE in Supabase → SQL Editor. Non-destructive.
-- Management/HR issue certificates to anyone; leads request them
-- (status 'Requested' → management issues → 'Issued').
-- ============================================================

create table if not exists public.certificates (
  id text primary key,
  recipient_id text,
  recipient_name text,
  type text,
  title text,
  message text,
  issued_by text,
  issued_by_name text,
  status text default 'Issued',
  file_url text,
  file_name text,
  created_at timestamptz not null default now()
);

-- Uploaded certificate file (safe to re-run on an existing table)
alter table public.certificates add column if not exists file_url text;
alter table public.certificates add column if not exists file_name text;

alter table public.certificates enable row level security;
drop policy if exists cert_read on public.certificates;
create policy cert_read on public.certificates for select to authenticated using (true);
drop policy if exists cert_write on public.certificates;
create policy cert_write on public.certificates for all to authenticated using (true) with check (true);

do $$
begin
  begin execute 'alter publication supabase_realtime add table public.certificates'; exception when duplicate_object then null; end;
end $$;
