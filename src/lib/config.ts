/* ============================================================
   NEXUS TALENT OS - Runtime configuration
   The app runs in DEMO mode out of the box and automatically
   switches to LIVE mode when the matching env vars are present.
   ============================================================ */

// NEXT_PUBLIC_* vars are inlined at build time, so these are safe on the client.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/** True when Supabase auth + database are configured (live auth/data). */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
