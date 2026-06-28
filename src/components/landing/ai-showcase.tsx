import { ScanSearch, Check, Sparkles, FileText, Zap } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Button } from "@/components/ui/button";

const capabilities = [
  "Extracts skills & experience from any resume",
  "Generates a concise candidate summary",
  "Calculates a precise role fit score",
  "Surfaces strengths and skill gaps instantly",
];

export function AiShowcase() {
  return (
    <section id="ai" className="relative overflow-hidden bg-gradient-navy px-6 py-24 grain">
      <div className="absolute inset-0 grid-dark opacity-50" />
      <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-mjblue/20 blur-[120px] animate-float-slow" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        {/* copy */}
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-sky-200">
            <Sparkles className="h-3.5 w-3.5" /> AI Recruitment Engine
          </span>
          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            AI that reads between <span className="text-gradient-animated-light">the lines.</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/65">
            Stop manually reviewing hundreds of resumes. Nexus Talent OS parses every
            application, scores candidates against the role, and recommends the
            best next step - in seconds.
          </p>

          <ul className="mt-8 space-y-3">
            {capabilities.map((c, i) => (
              <Reveal key={c} delay={i * 0.08}>
                <li className="flex items-center gap-3 text-white/85">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mjblue/20 text-sky">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {c}
                </li>
              </Reveal>
            ))}
          </ul>

          <div className="mt-9">
            <Button href="/dashboard/ai-engine" size="lg">
              See the AI engine
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>

        {/* visual card */}
        <Reveal delay={0.15}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-mjblue/15 blur-3xl" />
            <div className="glass-dark relative rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-mjblue/20 text-sky">
                    <ScanSearch className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Resume Intelligence</p>
                    <p className="text-[11px] text-white/50">Aarav Sharma · Marketing</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                  <FileText className="h-3 w-3" /> Parsed
                </span>
              </div>

              <div className="mt-6 flex items-center gap-6">
                <ProgressRing value={92} size={120} stroke={10}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">92</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/50">
                      Fit Score
                    </p>
                  </div>
                </ProgressRing>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    Extracted skills
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["SEO", "Content", "Analytics", "Canva", "Ads"].map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-sky-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                      ✓ Strong Hire
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] font-semibold text-emerald-300">Strengths</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    Data-driven SEO, strong written communication, owns outcomes.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] font-semibold text-amber-300">Skill gaps</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    Limited paid-ads budgeting, no team-lead exposure yet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
