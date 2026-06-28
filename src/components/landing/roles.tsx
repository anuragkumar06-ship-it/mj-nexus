import { Users, UserCog, Crown, GraduationCap, Check } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { SpotlightCard } from "@/components/shared/spotlight-card";

const roles = [
  {
    icon: Users,
    title: "HR Team",
    color: "from-mjblue to-sky",
    points: ["AI resume screening", "Interview scheduling", "Recruitment tracking"],
  },
  {
    icon: UserCog,
    title: "Team Leaders",
    color: "from-mjblue-600 to-mjblue",
    points: ["Assign & track tasks", "Monitor performance", "Give structured feedback"],
  },
  {
    icon: Crown,
    title: "Founders",
    color: "from-navy to-mjblue-700",
    points: ["Hiring oversight", "Growth monitoring", "Workforce planning"],
  },
  {
    icon: GraduationCap,
    title: "Interns",
    color: "from-sky to-mjblue",
    points: ["Tasks & standups", "Learning resources", "Progress visibility"],
  },
];

export function Roles() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-mjblue-50 px-4 py-1.5 text-xs font-semibold text-mjblue-700 ring-1 ring-inset ring-mjblue/15">
            For everyone
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Built for <span className="text-gradient-animated">every role</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500">
            One platform that gives every member of the team exactly what they
            need - from first application to final certificate.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <Reveal key={r.title} delay={(i % 4) * 0.08}>
                <SpotlightCard className="gradient-ring h-full rounded-3xl border border-navy/5 bg-white p-6 shadow-card">
                  <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br ${r.color} text-white shadow-[0_8px_24px_-8px_rgba(29,127,255,0.5)]`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-navy">{r.title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mjblue-50 text-mjblue">
                          <Check className="h-3 w-3" />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
