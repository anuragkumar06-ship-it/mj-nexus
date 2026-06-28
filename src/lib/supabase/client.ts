"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

/**
 * Browser Supabase client. Only call when isSupabaseConfigured() is true.
 * Uses a long-lived (1-year) auth cookie + auto-refresh so a signed-in user stays
 * signed in across page reloads and browser restarts — no need to log in again.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 365, // 1 year — persist the session across visits
      sameSite: "lax",
      path: "/",
    },
  });
}
