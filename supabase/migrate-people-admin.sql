-- ============================================================
-- MJ NEXUS — People admin upgrade (SAFE / additive)
-- Run ONCE in Supabase → SQL Editor.
-- Lets management add people manually + set internship duration.
-- ============================================================

-- Allow profiles that aren't (yet) linked to an auth login,
-- so management can add a teammate before they sign up.
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- Internship duration
alter table public.profiles add column if not exists intern_start text;
alter table public.profiles add column if not exists intern_end text;

-- Profile picture
alter table public.profiles add column if not exists avatar_url text;
