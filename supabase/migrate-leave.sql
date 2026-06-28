-- ============================================================
-- MJ NEXUS — Leave request fields (SAFE / additive)
-- Run ONCE in Supabase → SQL Editor. Non-destructive.
-- Adds leave duration (from/to) + reason to approval requests.
-- ============================================================

alter table public.requests add column if not exists from_date text;
alter table public.requests add column if not exists to_date text;
alter table public.requests add column if not exists reason text;
alter table public.requests add column if not exists leave_type text;
alter table public.requests add column if not exists granted_type text;
