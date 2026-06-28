/* ============================================================
   NEXUS TALENT OS - AI provider (server only)
   Calls OpenAI or Gemini via fetch using env keys.
   Import ONLY from server route handlers.
   ============================================================ */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function aiProvider(): "openai" | "gemini" {
  return (process.env.AI_PROVIDER ?? "openai").toLowerCase() === "gemini" ? "gemini" : "openai";
}

/** True when an API key for the selected provider is present. */
export function isAiConfigured(): boolean {
  return aiProvider() === "gemini" ? !!process.env.GEMINI_API_KEY : !!process.env.OPENAI_API_KEY;
}

interface ChatOpts {
  temperature?: number;
  maxTokens?: number;
}

export async function chat(messages: ChatMessage[], opts: ChatOpts = {}): Promise<string> {
  return aiProvider() === "gemini" ? geminiChat(messages, opts) : openaiChat(messages, opts);
}

async function openaiChat(messages: ChatMessage[], opts: ChatOpts): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.5,
      max_tokens: opts.maxTokens ?? 600,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

async function geminiChat(messages: ChatMessage[], opts: ChatOpts): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const systemText = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const body = JSON.stringify({
    system_instruction: systemText ? { parts: [{ text: systemText }] } : undefined,
    contents,
    generationConfig: { temperature: opts.temperature ?? 0.5, maxOutputTokens: opts.maxTokens ?? 600 },
  });

  // Try several models in order so a deprecated/unavailable name doesn't kill the call.
  const models = [
    process.env.GEMINI_MODEL,
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash",
  ].filter((m): m is string => Boolean(m));

  let lastErr = "no models tried";
  for (const model of [...new Set(models)]) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body }
      );
      if (!res.ok) {
        lastErr = `${model}: ${res.status} ${await res.text()}`;
        continue;
      }
      const data: any = await res.json();
      const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
      if (text) return text;
      lastErr = `${model}: empty response`;
    } catch (e) {
      lastErr = `${model}: ${String(e)}`;
    }
  }
  throw new Error(`Gemini failed - ${lastErr}`);
}

/** Best-effort JSON extraction from an LLM response. */
export function parseJson<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text) as T;
  } catch {
    return null;
  }
}
