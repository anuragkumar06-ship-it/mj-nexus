import { NextResponse } from "next/server";
import { chat, isAiConfigured, parseJson } from "@/lib/ai";

export const runtime = "nodejs";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

function deterministic(b: any) {
  const skills: string[] = Array.isArray(b.skills) ? b.skills : [];
  let h = 0;
  for (const c of String(b.name ?? "")) h = (h * 31 + c.charCodeAt(0)) % 97;
  const base = clamp(70 + skills.length * 3 + (h % 12), 55, 97);
  const labels = ["Relevant Skills", "Experience", "Communication", "Education", "Portfolio Quality"];
  const offs = [2, -4, -1, 4, -3];
  const first = String(b.name ?? "Candidate").split(" ")[0];
  return {
    fitScore: base,
    summary: `${first} is a ${String(b.role ?? "role").toLowerCase()} candidate with strong signal across ${skills.slice(0, 2).join(" and ") || "core skills"}. Fit score ${base}/100.`,
    strengths: [`Hands-on ${skills[0] ?? "core"} capability`, skills[1] ? `Solid ${skills[1]} fundamentals` : "Clear communication", "Owns outcomes end-to-end"],
    gaps: base >= 85 ? ["Limited large-team exposure", "Could deepen analytics tooling"] : ["Needs more project depth", "Limited measurable impact so far"],
    scores: labels.map((label, i) => ({ label, value: clamp(base + offs[i], 45, 99) })),
    recommendation: base >= 88 ? "Strong Hire" : base >= 78 ? "Hire" : base >= 68 ? "Consider" : "Hold",
  };
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));

  if (!isAiConfigured()) {
    return NextResponse.json({ ...deterministic(b), source: "demo" });
  }
  try {
    const prompt =
      `Score this internship candidate and respond with STRICT JSON only (no markdown). Shape: ` +
      `{"fitScore": number 0-100, "summary": string, "strengths": string[3], "gaps": string[2], ` +
      `"recommendation": "Strong Hire"|"Hire"|"Consider"|"Hold", "scores": [{"label": string, "value": number}] for ` +
      `Relevant Skills, Experience, Communication, Education, Portfolio Quality}. ` +
      `Candidate: ${b.name}, role ${b.role}, experience ${b.experience}, skills: ${(b.skills ?? []).join(", ")}.`;
    const raw = await chat(
      [
        { role: "system", content: "You are an expert technical recruiter. Output strict JSON only." },
        { role: "user", content: prompt },
      ],
      { maxTokens: 500, temperature: 0.3 }
    );
    const parsed = parseJson<any>(raw);
    if (parsed && typeof parsed.fitScore === "number") {
      return NextResponse.json({ ...deterministic(b), ...parsed, source: "live" });
    }
    return NextResponse.json({ ...deterministic(b), source: "fallback" });
  } catch {
    return NextResponse.json({ ...deterministic(b), source: "fallback" });
  }
}
