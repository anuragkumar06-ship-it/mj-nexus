"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Flag, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { initials } from "@/lib/data";
import { useWorkspace } from "@/components/dashboard/workspace-context";

const columns = [
  { key: "To Do", color: "#94A3B8" },
  { key: "In Progress", color: "#1D7FFF" },
  { key: "Review", color: "#8B5CF6" },
  { key: "Done", color: "#16A34A" },
] as const;

const priorityTone: Record<string, "red" | "amber" | "slate"> = {
  High: "red",
  Medium: "amber",
  Low: "slate",
};

export function TaskBoard() {
  const { tasks } = useWorkspace();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {columns.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key}>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: col.color }} />
              <span className="text-sm font-semibold text-navy">{col.key}</span>
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[11px] font-bold text-navy/50">
                {items.length}
              </span>
            </div>
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {items.map((t) => (
                  <motion.div
                    layout
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-mjblue-50 px-1.5 py-0.5 text-[10px] font-semibold text-mjblue-700">
                        {t.tag}
                      </span>
                      <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium leading-snug text-navy">{t.title}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-navy/5 pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-[9px] font-bold text-white">
                          {initials(t.assignee)}
                        </span>
                        <span className="text-[11px] text-slate-500">{t.assignee.split(" ")[0]}</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">{t.due}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-navy/10 py-6 text-center text-xs text-slate-400">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StandupFeed() {
  const { standups } = useWorkspace();
  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {standups.map((s) => (
          <motion.div
            layout
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">
                {initials(s.intern)}
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">{s.intern}</p>
                <p className="text-[11px] text-slate-400">{s.date}</p>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              <div>
                <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </p>
                <p className="mt-1 text-xs leading-relaxed text-navy/70">{s.completed}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[11px] font-semibold text-mjblue">
                  <Flag className="h-3 w-3" /> Priorities
                </p>
                <p className="mt-1 text-xs leading-relaxed text-navy/70">{s.priorities}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                  <TriangleAlert className="h-3 w-3" /> Challenges
                </p>
                <p className="mt-1 text-xs leading-relaxed text-navy/70">{s.challenges}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
