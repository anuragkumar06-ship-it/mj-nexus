"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  Check,
  TriangleAlert,
  ArrowRight,
  ScanSearch,
  GraduationCap,
} from "lucide-react";
import { ProgressRing } from "@/components/shared/progress-ring";
import { ScoreBar } from "@/components/shared/charts";
import {
  initials,
  ROLE_COLORS,
  type Candidate,
  type Role,
} from "@/lib/data";
import { useRecruitment } from "@/components/dashboard/recruitment-context";
import { cn, clamp } from "@/lib/utils";

const criteriaLabels = [
  "Relevant Skills",
  "Experience",
  "Communication",
  "Education",
  "Portfolio Quality",
];
const offsets = [2, -4, -1, 4, -3];

function getAnalysis(c: Candidate) {
  const scores = criteriaLabels.map((label, i) => ({
    label,
    value: clamp(c.fitScore + offsets[i], 42, 99),
  }));
  const rec =
    c.fitScore >= 88
      ? { label: "Strong Hire", tone: "bg-emerald-50 text-emerald-600" }
      : c.fitScore >= 78
        ? { label: "Hire", tone: "bg-mjblue-50 text-mjblue-700" }
        : c.fitScore >= 68
          ? { label: "Consider", tone: "bg-amber-50 text-amber-600" }
          : { label: "Hold", tone: "bg-slate-100 text-slate-500" };

  const summary = `${c.name.split(" ")[0]} is a ${c.role.toLowerCase()} candidate from ${c.college} with ${c.experience.toLowerCase()} of relevant exposure. Strong signal across ${c.skills.slice(0, 2).join(" and ")}, with a fit score of ${c.fitScore}/100 for the ${c.role} internship track.`;

  const strengths = [
    `Hands-on ${c.skills[0]} capability`,
    c.skills[1] ? `Solid ${c.skills[1]} fundamentals` : "Clear written communication",
    "Owns outcomes end-to-end",
  ];
  const gaps =
    c.fitScore >= 85
      ? ["Limited large-team exposure", "Could deepen analytics tooling"]
      : ["Needs more hands-on project depth", "Limited measurable impact so far"];

  const nextSteps =
    c.fitScore >= 78
      ? ["Schedule role-fit interview", "Share a short case task", "Verify portfolio links"]
      : ["Request work samples", "Screen for fundamentals", "Re-evaluate after task"];

  return { scores, rec, summary, strengths, gaps, nextSteps, confidence: clamp(c.fitScore + 4, 60, 99) };
}

export function AiEnginePanel() {
  const { candidates } = useRecruitment();
  const queue = [...candidates].sort((a, b) => b.fitScore - a.fitScore);
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = queue.find((c) => c.id === selectedId) ?? queue[0];
  if (!selected)
    return (
      <div className="rounded-3xl border border-navy/5 bg-white p-12 text-center shadow-card">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mjblue-50 text-mjblue">
          <ScanSearch className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-navy">No candidates to score yet</h3>
        <p className="mt-1 text-sm text-slate-500">Add applicants in the Recruitment module — the AI engine will score them here.</p>
      </div>
    );
  const a = getAnalysis(selected);

  return (
    <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
      {/* Queue */}
      <div className="rounded-3xl border border-navy/5 bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-navy">Parsing queue</p>
          <span className="flex items-center gap-1 rounded-full bg-mjblue-50 px-2 py-0.5 text-[11px] font-bold text-mjblue-700">
            <ScanSearch className="h-3 w-3" /> {queue.length}
          </span>
        </div>
        <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {queue.map((c) => {
            const active = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all",
                  active
                    ? "border-mjblue/30 bg-mjblue-50/60 shadow-[0_8px_24px_-14px_rgba(29,127,255,0.5)]"
                    : "border-transparent hover:bg-navy/[0.03]"
                )}
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">
                  {initials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">{c.name}</p>
                  <p className="truncate text-[11px] text-slate-500">
                    {c.role} · {c.experience}
                  </p>
                </div>
                <span className="text-sm font-bold text-navy tabular-nums">{c.fitScore}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-navy/5 bg-white p-6 shadow-card"
        >
          {/* header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-lg font-bold text-white">
                {initials(selected.name)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy">{selected.name}</h3>
                <p className="text-sm text-slate-500">
                  <span style={{ color: ROLE_COLORS[selected.role as Role] }} className="font-semibold">
                    {selected.role}
                  </span>{" "}
                  · {selected.email}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <GraduationCap className="h-3.5 w-3.5" /> {selected.college}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
              <FileText className="h-3.5 w-3.5" /> Resume parsed
            </span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
            {/* fit score ring */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-offwhite/70 p-5">
              <ProgressRing value={selected.fitScore} size={148} stroke={12}>
                <div className="text-center">
                  <p className="text-3xl font-bold text-navy">{selected.fitScore}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Fit Score</p>
                </div>
              </ProgressRing>
              <span className={cn("mt-3 rounded-full px-3 py-1 text-sm font-bold", a.rec.tone)}>
                ✓ {a.rec.label}
              </span>
              <p className="mt-2 text-[11px] text-slate-400">AI confidence {a.confidence}%</p>
            </div>

            {/* criteria */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Scoring breakdown
              </p>
              <div className="space-y-3.5">
                {a.scores.map((s, i) => (
                  <ScoreBar key={s.label} label={s.label} value={s.value} delay={i * 0.08} />
                ))}
              </div>
            </div>
          </div>

          {/* summary */}
          <div className="mt-6 rounded-2xl border border-mjblue/15 bg-mjblue-50/50 p-4">
            <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-mjblue-700">
              <Sparkles className="h-4 w-4" /> AI Candidate Summary
            </p>
            <p className="text-sm leading-relaxed text-navy/75">{a.summary}</p>
          </div>

          {/* extracted skills */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Extracted skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selected.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-navy/[0.04] px-2.5 py-1 text-xs font-medium text-navy/70"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* strengths / gaps */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <Check className="h-4 w-4" /> Strengths
              </p>
              <ul className="space-y-1.5">
                {a.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-navy/70">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <TriangleAlert className="h-4 w-4" /> Skill gaps
              </p>
              <ul className="space-y-1.5">
                {a.gaps.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-navy/70">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* next steps */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Suggested next steps:
            </span>
            {a.nextSteps.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-3 py-1 text-xs font-medium text-navy/70"
              >
                <ArrowRight className="h-3 w-3 text-mjblue" /> {s}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
