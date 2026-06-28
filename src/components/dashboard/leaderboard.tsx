"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { interns, initials, type Intern } from "@/lib/data";
import { cn } from "@/lib/utils";

const periods = ["Monthly", "Quarterly", "All-Time"] as const;
type Period = (typeof periods)[number];

function score(i: Intern, p: Period) {
  if (p === "Monthly") return i.performance;
  if (p === "Quarterly") return Math.round((i.performance + i.growth) / 2);
  return Math.round((i.performance + i.reliability + i.growth) / 3);
}

const rankStyle = [
  "bg-amber-100 text-amber-700 ring-amber-300",
  "bg-slate-100 text-slate-600 ring-slate-300",
  "bg-orange-100 text-orange-700 ring-orange-300",
];

const miniBars = [
  { key: "performance", label: "P", color: "#1D7FFF" },
  { key: "reliability", label: "R", color: "#6BC5FF" },
  { key: "growth", label: "G", color: "#0A6BEF" },
] as const;

export function Leaderboard() {
  const [period, setPeriod] = useState<Period>("Monthly");
  const ranked = [...interns].sort((a, b) => score(b, period) - score(a, period));

  return (
    <div className="rounded-3xl border border-navy/5 bg-white p-6 shadow-card">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-mjblue-50 text-mjblue">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-navy">Leaderboard</h3>
            <p className="text-sm text-slate-500">Ranked by composite index</p>
          </div>
        </div>

        <div className="flex rounded-full bg-navy/5 p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
            >
              {period === p && (
                <motion.span
                  layoutId="lb-tab"
                  className="absolute inset-0 rounded-full bg-white shadow-card"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={cn("relative", period === p ? "text-navy" : "text-navy/50")}>
                {p}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {ranked.map((it, i) => (
          <motion.div
            layout
            key={it.id}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
            className="flex items-center gap-3 rounded-2xl border border-navy/5 bg-offwhite/50 p-3"
          >
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ring-1 ring-inset",
                i < 3 ? rankStyle[i] : "bg-white text-navy/50 ring-navy/10"
              )}
            >
              {i + 1}
            </span>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">
              {initials(it.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">{it.name}</p>
              <p className="truncate text-xs text-slate-500">
                {it.team} · {it.role}
              </p>
            </div>

            {/* mini indices */}
            <div className="hidden w-40 shrink-0 space-y-1 sm:block">
              {miniBars.map((b) => (
                <div key={b.key} className="flex items-center gap-1.5">
                  <span className="w-3 text-[10px] font-bold text-slate-400">{b.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: b.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${it[b.key]}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="w-6 text-right text-[10px] font-semibold text-navy/60">
                    {it[b.key]}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-12 shrink-0 text-right">
              <p className="text-lg font-bold text-navy tabular-nums">{score(it, period)}</p>
              <p className="text-[9px] uppercase tracking-wide text-slate-400">index</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
