"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus, Inbox, Send, ClipboardList, Paperclip } from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { FileDropzone } from "@/components/app/upload";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/app/auth";
import { useApp, type ApprovalRequest, type Attachment } from "@/components/app/store";
import { initials, type Role } from "@/lib/org";
import { usePeople } from "@/components/app/people";
import { burstConfetti } from "@/lib/confetti";

const textareaClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10";

const typesByRole: Record<Role, string[]> = {
  intern: ["Leave", "Deadline Extension", "Resource", "Other"],
  lead: ["Headcount", "Budget", "Policy", "Other"],
  hr: ["Hiring Approval", "Headcount", "Policy", "Other"],
  management: [],
};

const statusTone: Record<string, "amber" | "green" | "red"> = { Pending: "amber", Approved: "green", Rejected: "red" };

export function ApprovalsView() {
  const { user, role } = useAuth();
  const { requests, createRequest, decideRequest } = useApp();
  const { personById, people } = usePeople();
  const { toast } = useToast();

  const inbox = requests.filter((r) => r.approverId === user.id && r.status === "Pending");
  const mine = requests.filter((r) => r.requesterId === user.id);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState(typesByRole[role][0] ?? "Other");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);

  const approverId = (() => {
    const mgmtId = people.find((p) => p.role === "management")?.id ?? "m1";
    return role === "intern" ? user.managerId ?? mgmtId : mgmtId;
  })();
  const canInitiate = role !== "management";

  const decide = (r: ApprovalRequest, decision: "Approved" | "Rejected") => {
    decideRequest(r.id, decision, decision === "Approved" ? "Approved." : "Not approved at this time.");
    if (decision === "Approved") burstConfetti();
    toast({ title: `Request ${decision.toLowerCase()}`, description: `${r.title} — ${personById(r.requesterId)?.name}.`, type: decision === "Approved" ? "success" : "info" });
  };

  const submit = () => {
    if (!title.trim()) { toast({ title: "Add a title", type: "error" }); return; }
    createRequest({ type, title: title.trim(), detail: detail.trim() || title.trim(), requesterId: user.id, approverId, files });
    toast({ title: "Request submitted", description: `Sent to ${personById(approverId)?.name} for approval.`, type: "success" });
    setTitle(""); setDetail(""); setFiles([]); setOpen(false);
  };

  return (
    <div className="space-y-6">
      {canInitiate && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> {role === "intern" ? "Raise request" : "Initiate request"}</Button>
        </div>
      )}

      {/* Action needed */}
      {(role === "lead" || role === "hr" || role === "management") && (
        <Card>
          <CardHeader
            title={role === "management" ? "Approvals queue" : "Action needed"}
            subtitle={role === "management" ? "Requests awaiting your sign-off" : "Requests from your reports"}
            icon={<Inbox className="h-5 w-5" />}
            action={<Badge tone="amber">{inbox.length} pending</Badge>}
          />
          {inbox.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nothing needs your approval right now. ✨</p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {inbox.map((r) => (
                  <motion.div layout key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} className="flex flex-col gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials(personById(r.requesterId)?.name ?? "")}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2"><Badge tone="blue">{r.type}</Badge><span className="text-[11px] text-slate-400">{r.createdAt}</span></div>
                        <p className="mt-1 text-sm font-semibold text-navy">{r.title}</p>
                        <p className="text-xs leading-relaxed text-slate-500">{r.detail}</p>
                        <p className="mt-1 text-[11px] text-slate-400">from {personById(r.requesterId)?.name}{r.files?.length ? ` · ${r.files.length} attachment` : ""}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => decide(r, "Rejected")} className="flex items-center gap-1.5 rounded-xl border border-navy/10 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"><X className="h-3.5 w-3.5" /> Decline</button>
                      <button onClick={() => decide(r, "Approved")} className="flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"><Check className="h-3.5 w-3.5" /> Approve</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      )}

      {/* My requests */}
      <Card>
        <CardHeader title="My requests" subtitle="Requests you've raised & their status" icon={<Send className="h-5 w-5" />} />
        {mine.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">{canInitiate ? "You haven't raised any requests yet." : "Management does not raise requests."}</p>
        ) : (
          <div className="space-y-2.5">
            {mine.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><Badge tone="navy">{r.type}</Badge>{r.files?.length ? <span className="flex items-center gap-0.5 text-[11px] text-slate-400"><Paperclip className="h-3 w-3" />{r.files.length}</span> : null}</div>
                  <p className="mt-1 truncate text-sm font-semibold text-navy">{r.title}</p>
                  <p className="text-xs text-slate-500">to {personById(r.approverId)?.name}{r.decisionNote ? ` · ${r.decisionNote}` : ""}</p>
                </div>
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Management oversight */}
      {role === "management" && (
        <Card>
          <CardHeader title="All activity" subtitle="Read-only oversight — leads & HR own their own approvals" icon={<ClipboardList className="h-5 w-5" />} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead><tr className="border-b border-navy/5 text-xs uppercase tracking-wider text-slate-400"><th className="pb-3 font-semibold">Request</th><th className="pb-3 font-semibold">Requester</th><th className="pb-3 font-semibold">Approver</th><th className="pb-3 text-right font-semibold">Status</th></tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-navy/[0.04] last:border-0">
                    <td className="py-3"><p className="font-medium text-navy">{r.title}</p><p className="text-xs text-slate-400">{r.type}</p></td>
                    <td className="py-3 text-slate-500">{personById(r.requesterId)?.name}</td>
                    <td className="py-3 text-slate-500">{personById(r.approverId)?.name}</td>
                    <td className="py-3 text-right"><Badge tone={statusTone[r.status]}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* New request modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={role === "intern" ? "Raise a request" : "Initiate a request"} description={`Sent to ${personById(approverId)?.name} for approval.`} icon={<Send className="h-5 w-5" />}
        footer={<><Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={submit}><Send className="h-4 w-4" /> Submit</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Type</label><select value={type} onChange={(e) => setType(e.target.value)} className={fieldClass}>{(typesByRole[role].length ? typesByRole[role] : ["Other"]).map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className={labelClass}>Approver</label><input disabled value={personById(approverId)?.name ?? ""} className={`${fieldClass} bg-navy/[0.03] text-slate-500`} /></div>
          </div>
          <div><label className={labelClass}>Title</label><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" className={fieldClass} /></div>
          <div><label className={labelClass}>Details</label><textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Add context for the approver…" className={textareaClass} /></div>
          <div><label className={labelClass}>Attachment <span className="font-normal text-slate-400">(optional)</span></label><FileDropzone files={files} onChange={setFiles} hint="Supporting docs or screenshots" /></div>
        </div>
      </Modal>
    </div>
  );
}
