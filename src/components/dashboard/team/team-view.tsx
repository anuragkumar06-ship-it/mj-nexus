"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquarePlus, UserPlus, ListChecks, Award } from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { ScoreBar } from "@/components/shared/charts";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/app/auth";
import { useApp } from "@/components/app/store";
import { initials } from "@/lib/org";
import { usePeople } from "@/components/app/people";
import { cn } from "@/lib/utils";

const textareaClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10";

export function TeamView() {
  const { user } = useAuth();
  const { tasks, feedback, addFeedback, createRequest } = useApp();
  const { reportsOf, personById } = usePeople();
  const { toast } = useToast();

  const reports = reportsOf(user.id);
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");
  const selected = reports.find((r) => r.id === selectedId) ?? reports[0];

  const [fbOpen, setFbOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState("");
  const [hcOpen, setHcOpen] = useState(false);
  const [hcDetail, setHcDetail] = useState("");

  if (!selected) return <p className="text-sm text-slate-500">No team members yet.</p>;

  const theirTasks = tasks.filter((t) => t.assigneeId === selected.id);
  const theirFeedback = feedback.filter((f) => f.internId === selected.id);

  const giveFeedback = () => {
    if (!note.trim()) {
      toast({ title: "Add a note", type: "error" });
      return;
    }
    addFeedback({ internId: selected.id, fromId: user.id, rating, note: note.trim() });
    toast({ title: "Feedback shared", description: `Sent to ${selected.name}. It now shows on their dashboard.`, type: "success" });
    setNote("");
    setRating(5);
    setFbOpen(false);
  };

  const requestHeadcount = () => {
    createRequest({
      type: "Headcount",
      title: `Add 1 ${user.team} intern`,
      detail: hcDetail.trim() || `Requesting approval to open 1 additional ${user.team} internship seat.`,
      requesterId: user.id,
      approverId: "m1",
    });
    toast({ title: "Request sent to Management", description: "Your headcount request is now in the management queue.", type: "success" });
    setHcDetail("");
    setHcOpen(false);
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setHcOpen(true)}><UserPlus className="h-4 w-4" /> Request headcount</Button>
        <Button size="sm" onClick={() => setFbOpen(true)}><MessageSquarePlus className="h-4 w-4" /> Give feedback</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* roster */}
        <Card className="h-fit">
          <CardHeader title="Team roster" subtitle={`${reports.length} interns · ${user.team}`} />
          <div className="space-y-2">
            {reports.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                  r.id === selectedId ? "border-mjblue/30 bg-mjblue-50/60" : "border-transparent hover:bg-navy/[0.03]"
                )}
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">{initials(r.name)}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-navy">{r.name}</p><p className="truncate text-xs text-slate-500">{r.title}</p></div>
                <span className="text-sm font-bold text-navy">{r.performance}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* detail */}
        <AnimatePresence mode="wait">
          <motion.div key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="space-y-4">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-lg font-bold text-white">{initials(selected.name)}</div>
                  <div>
                    <h3 className="text-lg font-bold text-navy">{selected.name}</h3>
                    <p className="text-sm text-slate-500">{selected.title} · joined {selected.joined}</p>
                  </div>
                </div>
                <Badge tone="blue">{selected.team}</Badge>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ScoreBar label="Performance" value={selected.performance ?? 0} />
                <ScoreBar label="Reliability" value={selected.reliability ?? 0} />
                <ScoreBar label="Growth" value={selected.growth ?? 0} />
                <ScoreBar label="Attendance" value={selected.attendance ?? 0} />
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="h-full">
                <CardHeader title="Assigned tasks" subtitle={`${theirTasks.length} total`} icon={<ListChecks className="h-5 w-5" />} />
                <div className="space-y-2.5">
                  {theirTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-2 rounded-2xl border border-navy/5 bg-offwhite/60 p-3">
                      <p className="min-w-0 truncate text-sm font-medium text-navy">{t.title}</p>
                      <Badge tone={t.status === "Approved" ? "green" : t.status === "Submitted" ? "amber" : t.status === "In Progress" ? "blue" : "slate"}>{t.status}</Badge>
                    </div>
                  ))}
                  {theirTasks.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No tasks assigned.</p>}
                </div>
              </Card>

              <Card className="h-full">
                <CardHeader title="Feedback history" subtitle="Your ratings & notes" icon={<Star className="h-5 w-5" />} />
                <div className="space-y-2.5">
                  {theirFeedback.map((f) => (
                    <div key={f.id} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</span>
                        <span className="text-[11px] text-slate-400">{f.date}</span>
                      </div>
                      <p className="text-sm text-navy/70">{f.note}</p>
                    </div>
                  ))}
                  {theirFeedback.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No feedback yet — add the first.</p>}
                </div>
              </Card>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback modal */}
      <Modal open={fbOpen} onClose={() => setFbOpen(false)} title="Give feedback" description={`Rate and coach ${selected.name}`} icon={<MessageSquarePlus className="h-5 w-5" />}
        footer={<><Button variant="ghost" size="sm" onClick={() => setFbOpen(false)}>Cancel</Button><Button size="sm" onClick={giveFeedback}><Award className="h-4 w-4" /> Share feedback</Button></>}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Rating</label>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setRating(i + 1)}>
                  <Star className={`h-8 w-8 transition-colors ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 hover:text-amber-200"}`} />
                </button>
              ))}
            </div>
          </div>
          <div><label className={labelClass}>Note</label><textarea autoFocus rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's going well, what to improve…" className={textareaClass} /></div>
        </div>
      </Modal>

      {/* Headcount modal */}
      <Modal open={hcOpen} onClose={() => setHcOpen(false)} title="Request headcount" description="This goes to Management for approval." icon={<UserPlus className="h-5 w-5" />}
        footer={<><Button variant="ghost" size="sm" onClick={() => setHcOpen(false)}>Cancel</Button><Button size="sm" onClick={requestHeadcount}><UserPlus className="h-4 w-4" /> Send to Management</Button></>}>
        <div><label className={labelClass}>Justification</label><textarea autoFocus rows={3} value={hcDetail} onChange={(e) => setHcDetail(e.target.value)} placeholder={`Why does the ${user.team} team need another intern?`} className={textareaClass} /></div>
      </Modal>
    </>
  );
}
