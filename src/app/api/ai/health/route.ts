import { NextResponse } from "next/server";
import { aiProvider, isAiConfigured } from "@/lib/ai";
import { isSupabaseConfigured } from "@/lib/config";

export const runtime = "nodejs";

/** Reports which live services are configured (useful to confirm a deploy). */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    mode: isSupabaseConfigured() || isAiConfigured() ? "live" : "demo",
    services: {
      supabase: isSupabaseConfigured(),
      ai: { provider: aiProvider(), configured: isAiConfigured() },
    },
  });
}
