"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ClipboardCheck,
  Check,
  RotateCcw,
  Paperclip,
  FileText,
  ListChecks,
} from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/app/auth";
import { useApp, type Submission, type Priority } from "@/components/app/store";
import { reportsOf, personById, initials } from "@/lib/org";
import { burstConfetti } from "@/lib/confetti";

const textareaClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10";

const statusTone: Record<string, "slate" | "blue" | "amber" | "green"> = {
  "To Do": "slate",
  "In Progress": "blue",
  Submitted: "amber",
  Approved: "green",
};

export function LeadReviews() {
  const { user } = useAuth();
  const { tasks, submissions, reviewSubmission, assignTask } = useApp();
  const { toast } = useToast();

  const reports = reportsOf(user.id);
  const teamTasks = tasks.filter((t) => t.assignerId === user.id);
  const pending = submissions.filter((s) => {
    const task = tasks.find((t) => t.id === s.taskId);
    return task?.assignerId === user.id && s.status === "Pending Review";
  });

  const [reviewSub, setReviewSub] = useState<Submission | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(reports[0]?.id ?? "");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [tag, setTag] = useState("Growth");
  const [due, setDue] = useState("This week");

  const openReview = (s: Submission) => {
    setReviewSub(s);
    setReviewNote("");
  };

  const decide = (decision: "Approved" | "Changes Requested") => {
    if (!reviewSub) return;
    reviewSubmission(reviewSub.id, decision, reviewNote.trim() || (decision === "Approved" ? "Approved — great work." : "Please revise and resubmit."));
    if (decision === "Approved") burstConfetti();
    toast({
      title: decision === "Approved" ? "Submission approved" : "Changes requested",
      description: `${personById(reviewSub.internId)?.name}'s work was ${decision === "Approved" ? "approved" : "sent back"}.`,
      type: decision === "Approved" ? "success" : "info",
    });
    setReviewSub(null);
  };

  const createTask = () => {
    if (!title.trim() || !assignee) {
      toast({ title: "Add a title and assignee", type: "error" });
      return;
    }
    assignTask({ title: title.trim(), assigneeId: assignee, assignerId: user.id, team: user.team ?? "Team", priority, due: due.trim() || "This week", tag: tag.trim() || "General" });
    toast({ title: "Task assigned", description: `"${title.trim()}" assigned to ${personById(assignee)?.name}.`, type: "success" });
    setTitle("");
    setAssignOpen(false);
  };

  const reviewTask = reviewSub ? tasks.find((t) => t.id === reviewSub.taskId) : null;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setAssignOpen(true)}><Plus className="h-4 w-4" /> Assign task</Button>
      </div>

      {/* Review queue */}
      <Card className="mb-6">
        <CardHeader title="Review queue" subtitle="Approve work or request changes — with proof attached" icon={<ClipboardCheck className="h-5 w-5" />} action={<Badge tone="amber">{pending.length} pending</Badge>} />
        {pending.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No submissions waiting for review. 🎉</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((s) => {
              const task = tasks.find((t) => t.id === s.taskId);
              return (
                <button key={s.id} onClick={() => openReview(s)} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-mjblue/20 hover:shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials(personById(s.internId)?.name ?? "")}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">{task?.title}</p>
                      <p className="text-xs text-slate-500">{personById(s.internId)?.name} · {s.submittedAt}</p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">{s.note}</p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-mjblue"><Paperclip className="h-3 w-3" /> {s.files.length} file{s.files.length > 1 ? "s" : ""} · tap to review</p>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Team task board */}
      <Card>
        <CardHeader title="Team tasks" subtitle={`All work across the ${user.team} pod`} icon={<ListChecks className="h-5 w-5" />} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(["To Do", "In Progress", "Submitted", "Approved"] as const).map((col) => {
            const items = teamTasks.filter((t) => t.status === col);
            return (
              <div key={col}>
                <div className="mb-3 flex items-center gap-2">
                  <Badge tone={statusTone[col]}>{col}</Badge>
                  <span className="text-[11px] font-bold text-navy/40">{items.length}</span>
                </div>
                <div className="space-y-2.5">
                  {items.map((t) => (
                    <div key={t.id} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5">
                      <p className="text-sm font-medium leading-snug text-navy">{t.title}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-[9px] font-bold text-white">{initials(personById(t.assigneeId)?.name ?? "")}</span>
                        <span className="text-[11px] text-slate-500">{personById(t.assigneeId)?.name.split(" ")[0]}</span>
                        <span className="ml-auto text-[11px] text-slate-400">{t.due}</span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="rounded-2xl border border-dashed border-navy/10 py-5 text-center text-xs text-slate-400">Empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Review modal */}
      <Modal
        open={!!reviewSub}
        onClose={() => setReviewSub(null)}
        title="Review submission"
        description={reviewTask?.title}
        icon={<ClipboardCheck className="h-5 w-5" />}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => decide("Changes Requested")}><RotateCcw className="h-4 w-4" /> Request changes</Button>
            <Button size="sm" onClick={() => decide("Approved")}><Check className="h-4 w-4" /> Approve</Button>
          </>
        }
      >
        {reviewSub && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-offwhite/60 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">{initials(personById(reviewSub.internId)?.name ?? "")}</div>
              <div><p className="text-sm font-semibold text-navy">{personById(reviewSub.internId)?.name}</p><p className="text-xs text-slate-500">Submitted {reviewSub.submittedAt}</p></div>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Intern's notes</p>
              <p className="rounded-xl bg-navy/[0.03] p-3 text-sm text-navy/75">{reviewSub.note}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Proof of work ({reviewSub.files.length})</p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {reviewSub.files.map((f, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-navy/8 bg-white">
                    {f.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.url} alt={f.name} className="h-20 w-full object-cover" />
                    ) : (
                      <div className="grid h-20 w-full place-items-center bg-navy/[0.03] text-mjblue"><FileText className="h-7 w-7" /></div>
                    )}
                    <p className="truncate px-2 py-1.5 text-[11px] font-medium text-navy">{f.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Review note</label>
              <textarea rows={2} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Optional feedback for the intern…" className={textareaClass} />
            </div>
          </div>
        )}
      </Modal>

      {/* Assign modal */}
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign a task"
        description="Create work for a team member."
        icon={<Plus className="h-5 w-5" />}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={createTask}><Plus className="h-4 w-4" /> Assign</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div><label className={labelClass}>Task title</label><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Draft the August newsletter" className={fieldClass} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Assignee</label><select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={fieldClass}>{reports.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div><label className={labelClass}>Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={fieldClass}><option>High</option><option>Medium</option><option>Low</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Tag</label><input value={tag} onChange={(e) => setTag(e.target.value)} className={fieldClass} /></div>
            <div><label className={labelClass}>Due</label><input value={due} onChange={(e) => setDue(e.target.value)} className={fieldClass} /></div>
          </div>
        </div>
      </Modal>
    </>
  );
}
