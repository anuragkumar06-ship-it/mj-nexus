import { Sparkles } from "lucide-react";

const items = [
  "AI Resume Scoring",
  "Candidate Fit Scores",
  "Smart Interview Scheduling",
  "Auto Certificates",
  "Recommendation Letters",
  "Performance Intelligence",
  "Daily Standups",
  "Live Hiring Analytics",
  "Geographic Insights",
  "Role-Based Access",
];

export function Marquee() {
  return (
    <section className="relative overflow-hidden border-y border-navy/5 bg-white/70 py-5 backdrop-blur">
      <div className="flex w-max animate-marquee gap-3">
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-2 rounded-full border border-navy/5 bg-offwhite/80 px-4 py-2 text-sm font-medium text-navy/70"
          >
            <Sparkles className="h-3.5 w-3.5 text-mjblue" />
            {t}
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-offwhite to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-offwhite to-transparent" />
    </section>
  );
}
