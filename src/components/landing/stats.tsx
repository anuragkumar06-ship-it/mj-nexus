import { Reveal } from "@/components/shared/reveal";
import { AnimatedCounter } from "@/components/shared/animated-counter";

const stats = [
  { value: 70, suffix: "%", label: "Less manual screening time", decimals: 0 },
  { value: 50, suffix: "%", label: "Faster onboarding process", decimals: 0 },
  { value: 10, suffix: "K+", label: "Applicants supported", decimals: 0 },
  { value: 99.9, suffix: "%", label: "Platform availability", decimals: 1 },
];

export function Stats() {
  return (
    <section id="platform" className="relative -mt-8 px-6 pb-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-navy p-8 shadow-[0_30px_80px_-30px_rgba(5,11,61,0.6)] sm:p-12 grain">
            <div className="absolute inset-0 grid-dark opacity-60" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-mjblue/20 blur-3xl" />
            <div className="relative">
              <div className="mb-9 max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
                  Outcomes that compound
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Built to remove friction across the entire internship lifecycle
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {stats.map((s, i) => (
                  <Reveal key={s.label} delay={i * 0.1}>
                    <div className="border-l border-white/10 pl-5">
                      <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        <AnimatedCounter
                          value={s.value}
                          suffix={s.suffix}
                          decimals={s.decimals}
                        />
                      </p>
                      <p className="mt-2 text-sm leading-snug text-white/60">{s.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
