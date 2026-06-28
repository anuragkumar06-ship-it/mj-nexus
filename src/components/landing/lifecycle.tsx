import {
  FileInput,
  ScanSearch,
  Video,
  Rocket,
  Gauge,
  Award,
} from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

const steps = [
  { icon: FileInput, title: "Apply", desc: "Candidate portal & resume upload" },
  { icon: ScanSearch, title: "AI Screen", desc: "Auto skill extraction & fit score" },
  { icon: Video, title: "Interview", desc: "Smart scheduling & AI assessment" },
  { icon: Rocket, title: "Onboard", desc: "Workspace, tasks & standups" },
  { icon: Gauge, title: "Perform", desc: "Performance & growth tracking" },
  { icon: Award, title: "Certify", desc: "Auto certificates & recommendations" },
];

export function Lifecycle() {
  return (
    <section id="lifecycle" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-mjblue-50 px-4 py-1.5 text-xs font-semibold text-mjblue-700 ring-1 ring-inset ring-mjblue/15">
            The Lifecycle
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            From application to{" "}
            <span className="text-gradient-brand">certification.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500">
            One continuous, intelligent flow - no spreadsheets, no scattered
            tools, no lost candidates.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-linear-to-r from-transparent via-mjblue/25 to-transparent lg:block" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 0.1}>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-card ring-1 ring-navy/5">
                      <Icon className="h-6 w-6 text-mjblue" />
                      <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-navy">{s.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {s.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
