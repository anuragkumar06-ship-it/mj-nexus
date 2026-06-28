import { NextResponse } from "next/server";
import { chat, isAiConfigured, type ChatMessage } from "@/lib/ai";

export const runtime = "nodejs";

const SYSTEM =
  "You are MJ Nexus AI, the assistant inside an AI-powered internship management platform for MJ Marketing Consultancy. " +
  "Be concise, warm, and specific. You help with candidates, interns, hiring, interviews, performance, certificates, and approvals. " +
  "Keep answers under 90 words unless asked for detail.";

function fallback(q: string): string {
  const s = q.toLowerCase();
  if (s.includes("top") || s.includes("best") || s.includes("candidate"))
    return "Your top candidates right now are Ananya Iyer (95), Arjun Kumar (93), and Aarav Sharma (92) — all Strong Hire. Aarav interviews Jun 27.";
  if (s.includes("hir") || s.includes("summary") || s.includes("month") || s.includes("perform"))
    return "This month: 271 applicants, 24 hires (7.3% conversion). Marketing is converting ~18% faster than last month; avg performance after hire is 88%.";
  if (s.includes("intern") || s.includes("attention") || s.includes("risk"))
    return "Rohan Mehta (81, trending down) and Kabir Singh (76) could use a check-in. Standout: Ananya Iyer at 96 with 98 reliability.";
  if (s.includes("certificate") || s.includes("cert"))
    return "142 certificates issued (28 this month) plus 64 recommendation letters. Use the Certificates module to generate a new one.";
  if (s.includes("recommend") || s.includes("letter"))
    return "Head to Certificates → Certificate Studio, pick the recipient, and I'll draft a personalized recommendation from their performance data.";
  if (s.includes("interview"))
    return "18 interviews are scheduled this week, 7 pending review. Arjun Kumar's last interview scored 91 (Strong Hire).";
  if (s.includes("approval") || s.includes("request"))
    return "There are pending approvals across teams — leads handle their own, and HR/lead escalations route to Management.";
  return "Based on current MJ Nexus data, start with the Analytics module for the full picture. Ask me about candidates, interns, hiring, interviews, or certificates.";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
  const last = messages[messages.length - 1]?.content ?? body.question ?? "";

  if (!isAiConfigured()) {
    return NextResponse.json({ reply: fallback(last), source: "demo" });
  }
  try {
    const reply = await chat([{ role: "system", content: SYSTEM }, ...messages], {
      maxTokens: 240,
      temperature: 0.5,
    });
    return NextResponse.json({ reply: reply || fallback(last), source: "live" });
  } catch {
    return NextResponse.json({ reply: fallback(last), source: "fallback" });
  }
}
