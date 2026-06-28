import { NextResponse } from "next/server";
import { chat, isAiConfigured, type ChatMessage } from "@/lib/ai";

export const runtime = "nodejs";

const SYSTEM =
  "You are Nexus Talent OS AI, the assistant inside an internship-management platform for Nexus Talent OS. " +
  "Answer ONLY from the live data provided below. If a number is 0 or a list is empty, say so plainly - never invent candidates, interns, names, or numbers. " +
  "Be concise (under 90 words), warm, and specific.";

/** Honest, data-driven reply when the AI model isn't available. */
function offlineReply(context: string): string {
  if (context && context.trim()) {
    return `Here's a live summary from your workspace:\n\n${context}\n\n(The AI model isn't responding right now, so this is a direct data summary rather than a generated answer.)`;
  }
  return "I don't see any data in your workspace yet. Once you add candidates, tasks, or approvals, I'll summarize and answer questions about them here.";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
  const context = typeof body.context === "string" ? body.context : "";

  if (!isAiConfigured()) {
    return NextResponse.json({ reply: offlineReply(context), source: "demo" });
  }
  try {
    const system =
      SYSTEM +
      (context ? `\n\n--- LIVE DATA FOR THIS USER ---\n${context}\n--- END DATA ---` : "\n\n(No data was provided; tell the user their workspace looks empty.)");
    const reply = await chat([{ role: "system", content: system }, ...messages], {
      maxTokens: 300,
      temperature: 0.4,
    });
    return NextResponse.json({ reply: reply || offlineReply(context), source: "live" });
  } catch (e) {
    return NextResponse.json({ reply: offlineReply(context), source: "fallback", error: String(e).slice(0, 300) });
  }
}
