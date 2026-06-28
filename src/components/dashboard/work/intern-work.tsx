"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Upload,
  CheckCircle2,
  Clock,
  RotateCcw,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, labelClass } from "@/components/ui/modal";
import { FileDropzone, AttachmentChips } from "@/components/app/upload";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/app/auth";
import { useApp, type Task, type Attachment } from "@/components/app/store";
import { burstConfetti } from "@/lib/confetti";

const columns = [
  { key: "To Do", color: "#94A3B8" },
  { key: "In Progress", color: "#1D7FFF" },
  { key: "Submitted", color: "#F59E0B" },
  { key: "Approved", color: "#16A34A" },
] as const;

const textareaClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10";

export function InternWork() {
  const { user } = useAuth();
  const { tasks, submissions, setTaskStatus, submitTask } = useApp();
  const { toast } = useToast();

  const myTasks = tasks.filter((t) => t.assigneeId === user.id);
  const [submitFor, setSubmitFor] = useState<Task | null>(null);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);

  const subOf = (t: Task) => submissions.find((s) => s.id === t.submissionId);

  const openSubmit = (t: Task) => {
    setSubmitFor(t);
    setNote("");
    setFiles([]);
  };

  const doSubmit = () => {
    if (!submitFor) return;
    if (files.length === 0) {
      toast({ title: "Attach your work", description: "Upload at least one screenshot or file to submit.", type: "error" });
      return;
    }
    submitTask(submitFor.id, user.id, note.trim() || "Work submitted.", files);
    burstConfetti();
    toast({ title: "Work submitted", description: `"${submitFor.title}" submitted for review.`, type: "success" });
    setSubmitFor(null);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => {
          const items = myTasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: col.color }} />
                <span className="text-sm font-semibold text-navy">{col.key}</span>
                <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[11px] font-bold text-navy/50">{items.length}</span>
              </div>
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {items.map((t) => {
                    const sub = subOf(t);
                    const changes = sub?.status === "Changes Requested";
                    return (
                      <motion.div
                        layout
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl border border-navy/5 bg-white p-3.5 shadow-card"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-mjblue-50 px-1.5 py-0.5 text-[10px] font-semibold text-mjblue-700">{t.tag}</span>
                          <span className="text-[10px] font-medium text-slate-400">due {t.due}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium leading-snug text-navy">{t.title}</p>

                        {changes && (
                          <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50/60 p-2 text-[11px] text-amber-700">
                            Changes requested: {sub?.reviewNote}
                          </div>
                        )}
                        {t.status === "Approved" && sub?.reviewNote && (
                          <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/60 p-2 text-[11px] text-emerald-700">
                            {sub.reviewNote}
                          </div>
                        )}
                        {sub && sub.files.length > 0 && (
                          <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400"><Paperclip className="h-3 w-3" /> {sub.files.length} file{sub.files.length > 1 ? "s" : ""} attached</p>
                        )}

                        <div className="mt-3">
                          {t.status === "To Do" && (
                            <button onClick={() => setTaskStatus(t.id, "In Progress")} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy/5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10">
                              <Play className="h-3.5 w-3.5" /> Start task
                            </button>
                          )}
                          {t.status === "In Progress" && (
                            <button onClick={() => openSubmit(t)} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-brand py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02]">
                              {changes ? <RotateCcw className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />} {changes ? "Resubmit work" : "Submit work"}
                            </button>
                          )}
                          {t.status === "Submitted" && (
                            <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2 text-xs font-semibold text-amber-600"><Clock className="h-3.5 w-3.5" /> Awaiting review</span>
                          )}
                          {t.status === "Approved" && (
                            <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Approved</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {items.length === 0 && <div className="rounded-2xl border border-dashed border-navy/10 py-6 text-center text-xs text-slate-400">Empty</div>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!submitFor}
        onClose={() => setSubmitFor(null)}
        title="Submit your work"
        description={submitFor?.title}
        icon={<Upload className="h-5 w-5" />}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSubmitFor(null)}>Cancel</Button>
            <Button size="sm" onClick={doSubmit}><Upload className="h-4 w-4" /> Submit for review</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Notes for your reviewer</label>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Summarize what you did, links, results…" className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>Proof of work <span className="font-normal text-slate-400">(required)</span></label>
            <FileDropzone files={files} onChange={setFiles} />
          </div>
          {files.length > 0 && (
            <div className="rounded-xl bg-mjblue-50/60 p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-mjblue-700"><ImageIcon className="h-3.5 w-3.5" /> Attached</p>
              <AttachmentChips files={files} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
