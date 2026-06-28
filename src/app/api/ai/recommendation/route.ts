import { NextResponse } from "next/server";
import { chat, isAiConfigured } from "@/lib/ai";

export const runtime = "nodejs";

function template(b: any): string {
  const first = (b.name ?? "The intern").split(" ")[0];
  if (b.type === "Appreciation") {
    return `It is my pleasure to recognize ${b.name} for outstanding contributions to the ${b.team} team at Nexus Talent OS. ${first} consistently exceeded expectations, maintaining a ${b.performance}% performance score and a ${b.reliability}% reliability index. ${first} brought energy, ownership, and a growth mindset to every project, and is a genuine asset to any team.`;
  }
  return `To whom it may concern,\n\nI am delighted to recommend ${b.name}, who completed a ${b.role} internship with the ${b.team} team at Nexus Talent OS. Over the program, ${first} achieved a ${b.performance}% performance score, a ${b.reliability}% reliability index, and a ${b.growth}% growth index - reflecting strong execution, dependability, and rapid development.\n\n${first} is proactive, collaborative, and consistently delivers high-quality work. I recommend ${first} without reservation for any future role.`;
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));

  if (!isAiConfigured()) {
    return NextResponse.json({ letter: template(b), source: "demo" });
  }
  try {
    const prompt =
      `Write a ${b.type === "Appreciation" ? "warm appreciation note" : "professional recommendation letter"} for ${b.name}, ` +
      `a ${b.role} intern on the ${b.team} team at Nexus Talent OS. ` +
      `Metrics - performance ${b.performance}%, reliability ${b.reliability}%, growth ${b.growth}%. ` +
      `Be specific, sincere, and concise (max 140 words). Sign off as "M. Joshi, Founder, Nexus Talent OS".`;
    const letter = await chat(
      [
        { role: "system", content: "You write concise, professional HR letters for Nexus Talent OS." },
        { role: "user", content: prompt },
      ],
      { maxTokens: 320, temperature: 0.6 }
    );
    return NextResponse.json({ letter: letter || template(b), source: "live" });
  } catch {
    return NextResponse.json({ letter: template(b), source: "fallback" });
  }
}
