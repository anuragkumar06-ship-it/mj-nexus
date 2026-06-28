"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus, Inbox, Send, ClipboardList, Paperclip, CalendarDays, Trash2, Pencil, FileText } from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { FileDropzone, AttachmentChips } from "@/components/app/upload";
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
  lead: ["Leave", "Headcount", "Budget", "Policy", "Other"],
  hr: ["Leave", "Hiring Approval", "Headcount", "Policy", "Other"],
  management: [],
};

// India-style leave types. "Unpaid" (leave without pay) extends the internship timeline.
const LEAVE_TYPES = ["Paid", "Casual", "Sick / Medical", "Earned", "Unpaid"];
const extendsTimeline = (t?: string) => (t ?? "").toLowerCase().includes("unpaid");

const statusTone: Record<string, "amber" | "green" | "red"> = { Pending: "amber", Approved: "green", Rejected: "red" };

const dayCount = (a?: string, b?: string) =>
  a && b ? Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1) : 0;

function addDays(iso: string, n: number) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function LeaveChip({ r }: { r: ApprovalRequest }) {
  if (!r.fromDate || !r.toDate) return null;
  const d = dayCount(r.fromDate, r.toDate);
  const lt = r.grantedType || r.leaveType;
  return (
    <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-mjblue-50 px-2 py-0.5 text-[11px] font-semibold text-mjblue-700">
      <CalendarDays className="h-3 w-3" /> {lt ? `${lt} · ` : ""}{r.fromDate} → {r.toDate} · {d} day{d > 1 ? "s" : ""}
    </p>
  );
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-navy/5 bg-offwhite/60 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-medium text-navy">{value}</p>
    </div>
  );
}

/** Per-user "cleared" record ids, synced via the DB (org_settings) with a localStorage fallback. */
function useClearedSet(userId: string, key: string, live: boolean) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    let active = true;
    (async () => {
      if (live) {
        try {
          const { loadSetting } = await import("@/lib/supabase/attendance-data");
          const raw = await loadSetting(`${key}:${userId}`);
          if (active && raw) {
            setIds(new Set(JSON.parse(raw)));
            return;
          }
        } catch {}
      }
      try {
        const raw = localStorage.getItem(`${key}_${userId}`);
        if (active && raw) setIds(new Set(JSON.parse(raw)));
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [userId, key, live]);
  const clear = (add: string[]) => {
    setIds((prev) => {
      const n = new Set(prev);
      add.forEach((i) => n.add(i));
      const arr = JSON.stringify([...n]);
      try {
        localStorage.setItem(`${key}_${userId}`, arr);
      } catch {}
      if (live) import("@/lib/supabase/attendance-data").then((m) => m.saveSetting(`${key}:${userId}`, arr)).catch(() => {});
      return n;
    });
  };
  return [ids, clear] as const;
}

export function ApprovalsView() {
  const { user, role } = useAuth();
  const { requests, createRequest, decideRequest, updateRequest, deleteRequest, live } = useApp();
  const { personById, people, updatePerson } = usePeople();
  const { toast } = useToast();
  const [clearedDecisions, clearDecisions] = useClearedSet(user.id, "cleared_decisions", live);
  const [clearedActivity, clearActivity] = useClearedSet(user.id, "cleared_activity", live);

  const inbox = requests.filter((r) => r.approverId === user.id && r.status === "Pending");
  const history = requests.filter((r) => r.approverId === user.id && r.status !== "Pending" && !clearedDecisions.has(r.id));
  const activity = requests.filter((r) => !clearedActivity.has(r.id));
  const mine = requests.filter((r) => r.requesterId === user.id);

  // Request modal (create + edit)
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState(typesByRole[role][0] ?? "Other");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const isLeave = type === "Leave";
  const leaveDays = dayCount(fromDate, toDate);

  // Detail + decide modals
  const [detailReq, setDetailReq] = useState<ApprovalRequest | null>(null);
  const [decideFor, setDecideFor] = useState<{ req: ApprovalRequest; decision: "Approved" | "Rejected" | "Changes" } | null>(null);
  const [granted, setGranted] = useState(LEAVE_TYPES[0]);
  const [decideNote, setDecideNote] = useState("");

  const approverId = (() => {
    const mgmtId = people.find((p) => p.role === "management")?.id ?? "m1";
    return role === "intern" ? user.managerId ?? mgmtId : mgmtId;
  })();
  const canInitiate = role !== "management";

  const resetForm = () => {
    setType(typesByRole[role][0] ?? "Other");
    setTitle("");
    setDetail("");
    setFiles([]);
    setFromDate("");
    setToDate("");
    setReason("");
    setLeaveType(LEAVE_TYPES[0]);
    setEditingId(null);
  };
  const openNew = () => {
    resetForm();
    setOpen(true);
  };
  const openEdit = (r: ApprovalRequest) => {
    setEditingId(r.id);
    setType(r.type);
    setTitle(r.title);
    setDetail(r.detail);
    setFiles(r.files ?? []);
    setFromDate(r.fromDate ?? "");
    setToDate(r.toDate ?? "");
    setReason(r.reason ?? "");
    setLeaveType(r.leaveType ?? LEAVE_TYPES[0]);
    setDetailReq(null);
    setOpen(true);
  };

  const submit = () => {
    if (isLeave) {
      if (!fromDate || !toDate) { toast({ title: "Pick your leave dates", type: "error" }); return; }
      if (new Date(toDate) < new Date(fromDate)) { toast({ title: "End date is before start date", type: "error" }); return; }
      if (!reason.trim()) { toast({ title: "Add a reason for leave", type: "error" }); return; }
    } else if (!title.trim()) {
      toast({ title: "Add a title", type: "error" });
      return;
    }
    const finalTitle = isLeave ? `${leaveType} leave — ${leaveDays} day${leaveDays > 1 ? "s" : ""}` : title.trim();
    const finalDetail = isLeave ? reason.trim() : detail.trim() || title.trim();
    const payload = {
      type,
      title: finalTitle,
      detail: finalDetail,
      files,
      fromDate: isLeave ? fromDate : undefined,
      toDate: isLeave ? toDate : undefined,
      reason: isLeave ? reason.trim() : undefined,
      leaveType: isLeave ? leaveType : undefined,
    };
    if (editingId) {
      updateRequest(editingId, payload);
      toast({ title: "Request updated", type: "success" });
    } else {
      createRequest({ ...payload, requesterId: user.id, approverId });
      toast({ title: "Request submitted", description: `Sent to ${personById(approverId)?.name} for approval.`, type: "success" });
    }
    resetForm();
    setOpen(false);
  };

  const doDelete = (r: ApprovalRequest) => {
    if (typeof window !== "undefined" && !window.confirm("Delete this request? This can't be undone.")) return;
    deleteRequest(r.id);
    setDetailReq(null);
    toast({ title: "Request deleted", type: "info" });
  };

  const askDecide = (req: ApprovalRequest, decision: "Approved" | "Rejected" | "Changes") => {
    setDecideFor({ req, decision });
    setGranted(req.leaveType ?? LEAVE_TYPES[0]);
    setDecideNote("");
  };

  const confirmDecide = () => {
    if (!decideFor) return;
    const { req, decision } = decideFor;
    if (decision === "Changes") {
      const msg = decideNote.trim() || "Please review and update this request.";
      updateRequest(req.id, { followUp: msg });
      if (live) import("@/lib/supabase/notifications-data").then((m) => m.notify(req.requesterId, `Changes requested on "${req.title}": ${msg}`, { type: "info", href: "/dashboard/approvals" })).catch(() => {});
      toast({ title: "Changes requested", description: `Sent back to ${personById(req.requesterId)?.name} to update.`, type: "info" });
      setDecideFor(null);
      return;
    }
    const isLeaveReq = !!req.leaveType || (!!req.fromDate && !!req.toDate);
    const bargained = isLeaveReq && req.leaveType && granted !== req.leaveType;
    const note = decideNote.trim() || (decision === "Approved" ? (bargained ? `Approved as ${granted} leave` : "Approved.") : "Not approved at this time.");
    if (decision === "Approved" && isLeaveReq) updateRequest(req.id, { grantedType: granted });
    decideRequest(req.id, decision, note);
    if (decision === "Approved") {
      burstConfetti();
      const requester = personById(req.requesterId);
      if (isLeaveReq && req.fromDate && req.toDate && requester?.internEnd && extendsTimeline(granted)) {
        const newEnd = addDays(requester.internEnd, dayCount(req.fromDate, req.toDate));
        updatePerson(requester.id, { internEnd: newEnd });
        toast({ title: "Approved · timeline updated", description: `${requester.name}'s internship now ends ${newEnd} (unpaid leave).`, type: "success" });
      } else {
        toast({ title: "Request approved", description: `${req.title} — ${personById(req.requesterId)?.name}.`, type: "success" });
      }
    } else {
      toast({ title: "Request declined", description: `${req.title} — ${personById(req.requesterId)?.name}.`, type: "info" });
    }
    setDecideFor(null);
  };

  return (
    <div className="space-y-6">
      {canInitiate && (
        <div className="flex justify-end">
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /> {role === "intern" ? "Raise request" : "Initiate request"}</Button>
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
                  <motion.div layout key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} onClick={() => setDetailReq(r)} className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-4 transition-colors hover:border-mjblue/20 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials(personById(r.requesterId)?.name ?? "")}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2"><Badge tone="blue">{r.type}</Badge><span className="text-[11px] text-slate-400">{r.createdAt}</span></div>
                        <p className="mt-1 text-sm font-semibold text-navy">{r.title}</p>
                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{r.detail}</p>
                        <LeaveChip r={r} />
                        <p className="mt-1 text-[11px] text-slate-400">from {personById(r.requesterId)?.name}{r.files?.length ? ` · ${r.files.length} attachment` : ""} · tap to view</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={(e) => { e.stopPropagation(); askDecide(r, "Rejected"); }} className="flex items-center gap-1.5 rounded-xl border border-navy/10 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"><X className="h-3.5 w-3.5" /> Decline</button>
                      <button onClick={(e) => { e.stopPropagation(); askDecide(r, "Approved"); }} className="flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"><Check className="h-3.5 w-3.5" /> Approve</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      )}

      {/* Decision history */}
      {(role === "lead" || role === "hr" || role === "management") && (
        <Card>
          <CardHeader title="Decision history" subtitle="Requests you've approved or declined" icon={<ClipboardList className="h-5 w-5" />} action={<div className="flex items-center gap-2">{history.length > 0 && <button onClick={() => clearDecisions(history.map((r) => r.id))} className="flex items-center gap-1 rounded-full border border-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-navy/60 transition-colors hover:text-rose-600"><Trash2 className="h-3 w-3" /> Clear</button>}<Badge tone="navy">{history.length}</Badge></div>} />
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No decisions yet — approved & declined requests will appear here.</p>
          ) : (
            <div className="space-y-2.5">
              {history.map((r) => (
                <div key={r.id} onClick={() => setDetailReq(r)} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5 transition-colors hover:border-mjblue/20">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials(personById(r.requesterId)?.name ?? "")}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><Badge tone="blue">{r.type}</Badge><span className="text-[11px] text-slate-400">{r.createdAt}</span></div>
                      <p className="mt-1 truncate text-sm font-semibold text-navy">{r.title}</p>
                      <LeaveChip r={r} />
                      <p className="truncate text-xs text-slate-500">from {personById(r.requesterId)?.name}{r.decisionNote ? ` · ${r.decisionNote}` : ""}</p>
                    </div>
                  </div>
                  <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* My requests */}
      {canInitiate && (
        <Card>
          <CardHeader title="My requests" subtitle="Tap a request to view, edit or delete it" icon={<Send className="h-5 w-5" />} />
          {mine.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">You haven&apos;t raised any requests yet.</p>
          ) : (
            <div className="space-y-2.5">
              {mine.map((r) => (
                <div key={r.id} onClick={() => setDetailReq(r)} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5 transition-colors hover:border-mjblue/20">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><Badge tone="navy">{r.type}</Badge>{r.files?.length ? <span className="flex items-center gap-0.5 text-[11px] text-slate-400"><Paperclip className="h-3 w-3" />{r.files.length}</span> : null}{r.followUp && r.status === "Pending" ? <span className="text-[11px] font-semibold text-amber-600">changes requested</span> : r.status === "Pending" && <span className="text-[11px] font-medium text-mjblue">editable</span>}</div>
                    <p className="mt-1 truncate text-sm font-semibold text-navy">{r.title}</p>
                    <LeaveChip r={r} />
                    <p className="text-xs text-slate-500">to {personById(r.approverId)?.name}{r.decisionNote ? ` · ${r.decisionNote}` : ""}</p>
                  </div>
                  <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Management oversight */}
      {role === "management" && (
        <Card>
          <CardHeader title="All activity" subtitle="Read-only oversight — tap a row to view" icon={<ClipboardList className="h-5 w-5" />} action={activity.length > 0 ? <button onClick={() => clearActivity(activity.map((r) => r.id))} className="flex items-center gap-1 rounded-full border border-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-navy/60 transition-colors hover:text-rose-600"><Trash2 className="h-3 w-3" /> Clear</button> : undefined} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead><tr className="border-b border-navy/5 text-xs uppercase tracking-wider text-slate-400"><th className="pb-3 font-semibold">Request</th><th className="pb-3 font-semibold">Requester</th><th className="pb-3 font-semibold">Approver</th><th className="pb-3 text-right font-semibold">Status</th></tr></thead>
              <tbody>
                {activity.map((r) => (
                  <tr key={r.id} onClick={() => setDetailReq(r)} className="cursor-pointer border-b border-navy/[0.04] transition-colors last:border-0 hover:bg-offwhite/60">
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

      {/* Request detail overlay */}
      <Modal
        open={!!detailReq}
        onClose={() => setDetailReq(null)}
        title={detailReq?.title ?? "Request"}
        description={detailReq ? `${detailReq.type} · ${detailReq.status}` : ""}
        icon={<FileText className="h-5 w-5" />}
        footer={
          detailReq ? (
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex gap-2">
                {detailReq.requesterId === user.id && detailReq.status === "Pending" && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => openEdit(detailReq)}><Pencil className="h-4 w-4" /> Edit</Button>
                    <button onClick={() => doDelete(detailReq)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {detailReq.approverId === user.id && detailReq.status === "Pending" && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { const r = detailReq; setDetailReq(null); askDecide(r, "Changes"); }}><Pencil className="h-4 w-4" /> Changes</Button>
                    <Button variant="outline" size="sm" onClick={() => { const r = detailReq; setDetailReq(null); askDecide(r, "Rejected"); }}>Decline</Button>
                    <Button size="sm" onClick={() => { const r = detailReq; setDetailReq(null); askDecide(r, "Approved"); }}>Approve</Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => setDetailReq(null)}>Close</Button>
              </div>
            </div>
          ) : null
        }
      >
        {detailReq && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials(personById(detailReq.requesterId)?.name ?? "")}</div>
                <div><p className="text-sm font-semibold text-navy">{personById(detailReq.requesterId)?.name}</p><p className="text-xs text-slate-500">to {personById(detailReq.approverId)?.name}</p></div>
              </div>
              <Badge tone={statusTone[detailReq.status]}>{detailReq.status}</Badge>
            </div>
            {detailReq.followUp && detailReq.status === "Pending" && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-sm text-amber-700">
                <span className="font-semibold">Changes requested:</span> {detailReq.followUp}
                {detailReq.requesterId === user.id && <span className="mt-1 block text-xs text-amber-600">Tap Edit below to update and resubmit.</span>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <DRow label="Type" value={detailReq.type} />
              {detailReq.leaveType && <DRow label="Leave type" value={detailReq.grantedType && detailReq.grantedType !== detailReq.leaveType ? `${detailReq.leaveType} → ${detailReq.grantedType}` : detailReq.leaveType} />}
              {detailReq.fromDate && <DRow label="From" value={detailReq.fromDate} />}
              {detailReq.toDate && <DRow label="To" value={detailReq.toDate} />}
              {detailReq.fromDate && detailReq.toDate && <DRow label="Duration" value={`${dayCount(detailReq.fromDate, detailReq.toDate)} day(s)`} />}
              <DRow label="Submitted" value={detailReq.createdAt} />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{detailReq.reason ? "Reason" : "Details"}</p>
              <p className="whitespace-pre-line rounded-xl bg-navy/[0.03] p-3 text-sm text-navy/75">{detailReq.reason || detailReq.detail}</p>
            </div>
            {detailReq.files && detailReq.files.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Attachments</p>
                <AttachmentChips files={detailReq.files} />
              </div>
            )}
            {detailReq.decisionNote && detailReq.status !== "Pending" && (
              <div className={`rounded-xl border p-3 text-sm ${detailReq.status === "Approved" ? "border-emerald-100 bg-emerald-50/60 text-emerald-700" : "border-rose-100 bg-rose-50/60 text-rose-700"}`}>{detailReq.decisionNote}</div>
            )}
            {detailReq.status !== "Pending" && detailReq.requesterId === user.id && (
              <p className="text-[11px] text-slate-400">This request is {detailReq.status.toLowerCase()} and can no longer be edited or deleted.</p>
            )}
          </div>
        )}
      </Modal>

      {/* Decide (approve/decline) modal with leave bargain */}
      <Modal
        open={!!decideFor}
        onClose={() => setDecideFor(null)}
        title={decideFor?.decision === "Approved" ? "Approve request" : decideFor?.decision === "Changes" ? "Request changes" : "Decline request"}
        description={decideFor ? `${personById(decideFor.req.requesterId)?.name} · ${decideFor.req.title}` : ""}
        icon={decideFor?.decision === "Approved" ? <Check className="h-5 w-5" /> : decideFor?.decision === "Changes" ? <Pencil className="h-5 w-5" /> : <X className="h-5 w-5" />}
        footer={<><Button variant="ghost" size="sm" onClick={() => setDecideFor(null)}>Cancel</Button><Button size="sm" onClick={confirmDecide}>{decideFor?.decision === "Approved" ? "Approve" : decideFor?.decision === "Changes" ? "Send back" : "Decline"}</Button></>}
      >
        {decideFor && (
          <div className="space-y-4">
            {decideFor.decision === "Approved" && (decideFor.req.leaveType || (decideFor.req.fromDate && decideFor.req.toDate)) && (
              <div>
                <label className={labelClass}>Grant as <span className="font-normal text-slate-400">(you can grant a different leave type)</span></label>
                <select value={granted} onChange={(e) => setGranted(e.target.value)} className={fieldClass}>{LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                {extendsTimeline(granted) ? (
                  <p className="mt-1.5 text-[11px] font-medium text-amber-600">Unpaid → the intern&apos;s internship end date will extend by {dayCount(decideFor.req.fromDate, decideFor.req.toDate)} day(s).</p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-slate-400">Timeline stays the same.</p>
                )}
              </div>
            )}
            <div>
              <label className={labelClass}>
                {decideFor.decision === "Changes" ? "What should they change?" : "Note"}{decideFor.decision !== "Changes" && <span className="font-normal text-slate-400"> (optional)</span>}
              </label>
              <textarea rows={3} value={decideNote} onChange={(e) => setDecideNote(e.target.value)} placeholder={decideFor.decision === "Changes" ? "e.g. I can only grant unpaid leave — please resubmit as unpaid." : "Add a note for the requester…"} className={textareaClass} />
            </div>
          </div>
        )}
      </Modal>

      {/* New / edit request modal */}
      <Modal open={open} onClose={() => { setOpen(false); resetForm(); }} title={editingId ? "Edit request" : role === "intern" ? "Raise a request" : "Initiate a request"} description={editingId ? "Update your request (only while it's pending)." : `Sent to ${personById(approverId)?.name} for approval.`} icon={<Send className="h-5 w-5" />}
        footer={<><Button variant="ghost" size="sm" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button><Button size="sm" onClick={submit}><Send className="h-4 w-4" /> {editingId ? "Save changes" : "Submit"}</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Type</label><select value={type} onChange={(e) => setType(e.target.value)} className={fieldClass}>{(typesByRole[role].length ? typesByRole[role] : ["Other"]).map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className={labelClass}>Approver</label><input disabled value={personById(approverId)?.name ?? ""} className={`${fieldClass} bg-navy/[0.03] text-slate-500`} /></div>
          </div>
          {isLeave ? (
            <>
              <div><label className={labelClass}>Leave type</label><select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className={fieldClass}>{LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>From</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={fieldClass} /></div>
                <div><label className={labelClass}>To</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={fieldClass} /></div>
              </div>
              {leaveDays > 0 && <p className="text-xs font-semibold text-mjblue">Duration: {leaveDays} day{leaveDays > 1 ? "s" : ""}</p>}
              <div><label className={labelClass}>Reason</label><textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for your leave…" className={textareaClass} /></div>
            </>
          ) : (
            <>
              <div><label className={labelClass}>Title</label><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" className={fieldClass} /></div>
              <div><label className={labelClass}>Details</label><textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Add context for the approver…" className={textareaClass} /></div>
            </>
          )}
          <div><label className={labelClass}>Attachment <span className="font-normal text-slate-400">(optional)</span></label><FileDropzone files={files} onChange={setFiles} hint="Supporting docs or screenshots" /></div>
        </div>
      </Modal>
    </div>
  );
}
