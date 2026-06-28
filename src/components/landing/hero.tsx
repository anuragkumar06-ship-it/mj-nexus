"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Play,
  TrendingUp,
  Award,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/shared/aurora-background";
import { TextReveal } from "@/components/shared/text-reveal";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { scrollY } = useScroll();
  const yPreview = useTransform(scrollY, [0, 700], [0, -70]);
  const yCopy = useTransform(scrollY, [0, 700], [0, 60]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0]);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-24 grain">
      <AuroraBackground variant="navy" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        {/* Left: copy */}
        <motion.div style={{ y: yCopy }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-sky-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              AI-Powered Talent Operating System
              <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            </span>
          </motion.div>

          <h1 className="mt-6 text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[4.1rem]">
            <TextReveal
              text="The operating system for internship-driven teams"
              highlight={["internship-driven"]}
              delay={0.15}
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/70"
          >
            Nexus Talent OS unifies recruitment, onboarding, performance, certification,
            and analytics into one intelligent platform - managing the complete
            candidate and intern lifecycle from application to certification.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button href="/dashboard" size="lg" className="shine">
              Launch Platform
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button href="/login" variant="glass" size="lg">
              <Play className="h-4 w-4" />
              Explore the demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease }}
            className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/55"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sky" /> Role-based & secure
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sky" /> Data-driven hiring
            </span>
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4 text-sky" /> Auto certification
            </span>
          </motion.div>
        </motion.div>

        {/* Right: floating dashboard preview with parallax */}
        <motion.div style={{ y: yPreview }}>
          <HeroPreview />
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.2em]">Scroll to explore</span>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.div>

      {/* bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 bg-linear-to-b from-transparent to-offwhite" />
    </section>
  );
}

function HeroPreview() {
  const [applicants, setApplicants] = useState(1284);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setApplicants((a) => a + 1);
      setPulse(true);
      setTimeout(() => setPulse(false), 700);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4, ease }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="absolute -inset-6 rounded-[2.5rem] bg-mjblue/20 blur-3xl" />

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass-navy relative rounded-3xl p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[11px] font-medium text-white/50">Nexus Talent OS · Overview</span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] text-white/50">Applicants</p>
            <p className="mt-1 text-lg font-bold text-white tabular-nums">
              {applicants.toLocaleString()}
            </p>
            <p className={`text-[10px] font-semibold transition-colors ${pulse ? "text-sky" : "text-emerald-300"}`}>
              {pulse ? "+1 just now" : "+13%"}
            </p>
          </div>
          {[
            { k: "Interns", v: "94", d: "+8%" },
            { k: "Avg Perf", v: "88%", d: "+2.4%" },
          ].map((t) => (
            <div key={t.k} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] text-white/50">{t.k}</p>
              <p className="mt-1 text-lg font-bold text-white">{t.v}</p>
              <p className="text-[10px] font-semibold text-emerald-300">{t.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-white/80">Hiring velocity</p>
            <span className="text-[10px] text-sky-200">Last 6 weeks</span>
          </div>
          <div className="flex h-24 items-end gap-2">
            {[42, 58, 50, 74, 66, 92].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.9, delay: 0.8 + i * 0.08, ease }}
                className="flex-1 rounded-t-md bg-linear-to-t from-mjblue to-sky"
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">
              AS
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Aarav Sharma</p>
              <p className="text-[10px] text-white/50">Marketing · Interview</p>
            </div>
          </div>
          <span className="rounded-full bg-mjblue/20 px-2 py-1 text-[10px] font-bold text-sky-200">
            92 fit
          </span>
        </div>
      </motion.div>

      {/* floating chips */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-10 top-20 hidden rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl sm:block"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky" />
          <div>
            <p className="text-[10px] text-white/60">AI Fit Score</p>
            <p className="text-sm font-bold text-white">92 / 100</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-6 bottom-16 hidden rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl sm:block"
      >
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-300" />
          <div>
            <p className="text-[10px] text-white/60">Certificate</p>
            <p className="text-sm font-bold text-white">Auto-issued</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
