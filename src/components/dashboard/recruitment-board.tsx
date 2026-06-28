"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, MapPin, Sparkles } from "lucide-react";
import {
  STAGE_META,
  ROLE_COLORS,
  initials,
  type Role,
} from "@/lib/data";
import { useRecruitment } from "@/components/dashboard/recruitment-context";
import { cn } from "@/lib/utils";

const roleFilters = ["All", "Marketing", "Sales", "HR"] as const;

function scoreTone(score: number) {
  if (score >= 90) return "bg-emerald-50 text-emerald-600";
  if (score >= 80) return "bg-mjblue-50 text-mjblue-700";
  if (score >= 70) return "bg-amber-50 text-amber-600";
  return "bg-slate-100 text-slate-500";
}

export function RecruitmentBoard() {
  const { candidates: allCandidates } = useRecruitment();
  const [role, setRole] = useState<(typeof roleFilters)[number]>("All");
  const filtered =
    role === "All" ? allCandidates : allCandidates.filter((c) => c.role === role);

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {roleFilters.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
              role === r
                ? "bg-navy text-white shadow-card"
                : "border border-navy/8 bg-white text-navy/60 hover:text-navy"
            )}
          >
            {r}
            {r !== "All" && (
              <span className="ml-1.5 text-xs opacity-60">
                {allCandidates.filter((c) => c.role === r).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
        {STAGE_META.map((col) => {
          const items = filtered.filter((c) => c.stage === col.key);
          return (
            <div key={col.key} className="w-[284px] shrink-0">
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-navy/5 bg-white px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: col.color }}
                  />
                  <span className="text-sm font-semibold text-navy">{col.label}</span>
                </div>
                <span className="rounded-full bg-navy/5 px-2 py-0.5 text-xs font-bold text-navy/60">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((c) => (
                    <motion.div
                      layout
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -3 }}
                      className="group cursor-pointer rounded-2xl border border-navy/5 bg-white p-3.5 shadow-card transition-shadow hover:shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">
                            {initials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-navy">
                              {c.name}
                            </p>
                            <span
                              className="text-[11px] font-medium"
                              style={{ color: ROLE_COLORS[c.role as Role] }}
                            >
                              {c.role}
                            </span>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                            scoreTone(c.fitScore)
                          )}
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          {c.fitScore}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
                        <p className="flex items-center gap-1.5">
                          <GraduationCap className="h-3 w-3" /> {c.college}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" /> {c.state} · {c.source}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-navy/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-navy/60"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {items.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-navy/10 py-8 text-center text-xs text-slate-400">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
