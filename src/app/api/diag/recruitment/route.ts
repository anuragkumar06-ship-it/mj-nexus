import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Read-only diagnostic: checks whether the `candidates` table and its newer
 * columns exist in the live database. Uses the public anon key only.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ configured: false });

  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const probe = async (select: string) => {
    try {
      const r = await fetch(`${url}/rest/v1/candidates?select=${select}&limit=1`, { headers });
      const text = await r.text();
      return { status: r.status, body: text.slice(0, 300) };
    } catch (e) {
      return { status: 0, body: String(e) };
    }
  };

  return NextResponse.json({
    configured: true,
    tableCore: await probe("id,name,stage"),
    newColumns: await probe("resume_url,resume_name,intern_start,intern_end"),
  });
}
