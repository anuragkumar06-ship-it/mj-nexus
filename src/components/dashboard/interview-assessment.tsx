"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gauge, ThumbsUp, MessageSquare } from "lucide-react";
import { ProgressRing } from "@/components/shared/progress-ring";
import { ScoreBar } from "@/components/shared/charts";
import { initials, type Interview } from "@/lib/data";
import { useInterviews } from "@/components/dashboard/interviews-context";
import { cn, clamp } from "@/lib/utils";

const metricLabels = [
  "Communication",
  "Confidence",
  "Technical Depth",
  "Role Fit",
  "Problem Solving",
];
const offsets = [1, -3, -1, 3, -2];

function assess(iv: Interview) {
  const s = iv.score ?? 80;
  const metrics = metricLabels.map((label, i) => ({
    label,
    value: clamp(s + offsets[i], 45, 99),
  }));
  const rec =
    s >= 88
      ? { label: "Strong Hire", tone: "bg-emerald-50 text-emerald-600" }
      : s >= 78
        ? { label: "Hire", tone: "bg-mjblue-50 text-mjblue-700" }
        : { label: "Consider", tone: "bg-amber-50 text-amber-600" };
  const first = iv.candidate.split(" ")[0];
  const summary = `${first} communicated with structure and clarity, handling ${iv.role.toLowerCase()} scenarios confidently. Strong role-fit signal with thoughtful, specific examples and high ownership throughout the conversation.`;
  return { metrics, rec, summary, sentiment: Math.round(clamp(s + 2, 50, 99)) };
}

export function InterviewAssessment() {
  const { interviews } = useInterviews();
  const assessable = interviews.filter((i) => typeof i.score === "number");
  const [id, setId] = useState<string>("");
  const selected = assessable.find((i) => i.id === id) ?? assessable[0];
  if (!selected)
    return (
      <div className="rounded-3xl border border-navy/5 bg-white p-6 shadow-card">
        <div className="mb-2 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-mjblue-50 text-mjblue"><Sparkles className="h-5 w-5" /></div>
          <div>
            <h3 className="text-base font-semibold text-navy">AI Interview Assessment</h3>
            <p className="text-sm text-slate-500">Transcript analysis &amp; role-fit scoring</p>
          </div>
        </div>
        <p className="py-8 text-center text-sm text-slate-400">No completed interviews to assess yet. Schedule one, then mark it completed with a score.</p>
      </div>
    );
  const a = assess(selected);

  return (
    <div className="rounded-3xl border border-navy/5 bg-white p-6 shadow-card">
      <div className="mb-5 flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-mjblue-50 text-mjblue">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-navy">AI Interview Assessment</h3>
          <p className="text-sm text-slate-500">Transcript analysis & role-fit scoring</p>
        </div>
      </div>

      {/* selector */}
      <div className="mb-5 flex flex-wrap gap-2">
        {assessable.map((iv) => (
          <button
            key={iv.id}
            onClick={() => setId(iv.id)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
              iv.id === id
                ? "border-mjblue/30 bg-mjblue-50 text-mjblue-700"
                : "border-navy/8 bg-white text-navy/60 hover:text-navy"
            )}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">
              {initials(iv.candidate)}
            </span>
            {iv.candidate.split(" ")[0]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-offwhite/70 p-5">
              <ProgressRing value={selected.score ?? 0} size={140} stroke={11}>
                <div className="text-center">
                  <p className="text-3xl font-bold text-navy">{selected.score}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Interview</p>
                </div>
              </ProgressRing>
              <span className={cn("mt-3 rounded-full px-3 py-1 text-sm font-bold", a.rec.tone)}>
                {a.rec.label}
              </span>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assessment metrics
              </p>
              <div className="space-y-3">
                {a.metrics.map((m, i) => (
                  <ScoreBar key={m.label} label={m.label} value={m.value} delay={i * 0.07} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <MessageSquare className="h-3.5 w-3.5" /> Sentiment
              </p>
              <p className="mt-1 text-xl font-bold text-navy">{a.sentiment}%</p>
              <p className="text-[11px] text-emerald-600">Positive</p>
            </div>
            <div className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Gauge className="h-3.5 w-3.5" /> Interviewer
              </p>
              <p className="mt-1 text-sm font-bold text-navy">{selected.interviewer}</p>
              <p className="text-[11px] text-slate-400">{selected.mode} · {selected.date.slice(5)}</p>
            </div>
            <div className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <ThumbsUp className="h-3.5 w-3.5" /> Recommendation
              </p>
              <p className="mt-1 text-sm font-bold text-navy">{a.rec.label}</p>
              <p className="text-[11px] text-slate-400">AI generated</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-mjblue/15 bg-mjblue-50/50 p-4">
            <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-mjblue-700">
              <Sparkles className="h-4 w-4" /> Candidate Summary
            </p>
            <p className="text-sm leading-relaxed text-navy/75">{a.summary}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
