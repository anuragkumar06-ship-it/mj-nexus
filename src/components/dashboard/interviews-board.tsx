"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Video, Phone, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { initials } from "@/lib/data";
import { useInterviews } from "@/components/dashboard/interviews-context";

const modeIcon: Record<string, React.ReactNode> = {
  Video: <Video className="h-3.5 w-3.5" />,
  "In-person": <MapPin className="h-3.5 w-3.5" />,
  Phone: <Phone className="h-3.5 w-3.5" />,
};

const statusTone: Record<string, "blue" | "green" | "amber"> = {
  Upcoming: "blue",
  Completed: "green",
  "Pending Review": "amber",
};

export function UpcomingInterviews() {
  const { interviews } = useInterviews();
  const upcoming = interviews.filter((i) => i.status === "Upcoming");

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {upcoming.map((iv) => (
          <motion.div
            layout
            key={iv.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5 transition-colors hover:border-mjblue/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                  {initials(iv.candidate)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">{iv.candidate}</p>
                  <p className="text-xs text-slate-500">{iv.role}</p>
                </div>
              </div>
              <Badge tone="sky">
                {modeIcon[iv.mode]} {iv.mode}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-navy/5 pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-mjblue" />
                {iv.date.slice(5)} · {iv.time}
              </span>
              <span>with {iv.interviewer}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function InterviewsTable() {
  const { interviews } = useInterviews();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-navy/5 text-xs uppercase tracking-wider text-slate-400">
            <th className="pb-3 font-semibold">Candidate</th>
            <th className="pb-3 font-semibold">Role</th>
            <th className="pb-3 font-semibold">Interviewer</th>
            <th className="pb-3 font-semibold">When</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 text-right font-semibold">Score</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((iv) => (
            <tr key={iv.id} className="border-b border-navy/[0.04] last:border-0">
              <td className="py-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">
                    {initials(iv.candidate)}
                  </div>
                  <span className="font-medium text-navy">{iv.candidate}</span>
                </div>
              </td>
              <td className="py-3 text-slate-500">{iv.role}</td>
              <td className="py-3 text-slate-500">{iv.interviewer}</td>
              <td className="py-3 text-slate-500">{iv.date.slice(5)} · {iv.time}</td>
              <td className="py-3">
                <Badge tone={statusTone[iv.status]}>{iv.status}</Badge>
              </td>
              <td className="py-3 text-right font-bold text-navy">{iv.score ? iv.score : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
