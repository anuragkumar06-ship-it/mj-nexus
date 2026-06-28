import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-navy px-8 py-16 text-center shadow-[0_40px_100px_-40px_rgba(5,11,61,0.7)] sm:px-16 sm:py-20 grain">
            <div className="absolute inset-0 grid-dark opacity-50" />
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-mjblue/25 blur-[100px]" />
            <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-sky/20 blur-[100px]" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                Ready to make Nexus Talent OS your{" "}
                <span className="text-gradient-animated-light">talent operating system?</span>
              </h2>
              <p className="mt-5 text-lg text-white/65">
                Launch the platform and explore every module with realistic
                sample data - recruitment, AI scoring, interviews, performance,
                and analytics.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button href="/dashboard" size="lg">
                  Launch Platform
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button href="/login" variant="glass" size="lg">
                  Sign in
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
