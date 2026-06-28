"use client";

import { useEffect, useState } from "react";
import { Award, Plus, Sparkles, Loader2, Download, Check, X, Inbox, FileSignature, Send, Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/app/upload";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/app/auth";
import { usePeople } from "@/components/app/people";
import { CertificatesProvider, useCertificates } from "@/components/dashboard/certificates/certificates-context";
import { CertificatePreview, downloadCert } from "@/components/dashboard/certificates/certificate-preview";
import { CERT_TYPES, certTitle, defaultMessage, type Certificate, type CertType } from "@/lib/certificates";
import { initials, type Person } from "@/lib/org";
import { Avatar } from "@/components/shared/avatar";
import type { Attachment } from "@/components/app/store";
import { burstConfetti } from "@/lib/confetti";

const textareaClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10";
const uuid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cert${Date.now()}`);
const statusTone: Record<string, "amber" | "green"> = { Requested: "amber", Issued: "green" };

export default function CertificatesPage() {
  return (
    <CertificatesProvider>
      <CertificatesView />
    </CertificatesProvider>
  );
}

function CertificatesView() {
  const { role, user } = useAuth();
  const { people, personById, internsAll } = usePeople();
  const { certificates, addCertificate, setStatus, removeCertificate } = useCertificates();
  const { toast } = useToast();

  const canIssue = role === "management" || role === "hr";
  const canRequest = role === "lead";

  const nameOf = (c: Certificate) => personById(c.recipientId)?.name ?? c.recipientName;
  const myCerts = certificates.filter((c) => c.recipientId === user.id && c.status === "Issued");
  const issued = certificates.filter((c) => c.status === "Issued");
  const requests = certificates.filter((c) => c.status === "Requested");
  const myRequests = certificates.filter((c) => c.issuedBy === user.id);

  const [issueOpen, setIssueOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [view, setView] = useState<Certificate | null>(null);

  const issueRequest = (c: Certificate) => {
    setStatus(c.id, "Issued", user.id, user.name);
    burstConfetti();
    toast({ title: "Certificate issued", description: `${nameOf(c)} · ${c.type}`, type: "success" });
  };
  const decline = (c: Certificate) => {
    removeCertificate(c.id);
    toast({ title: "Request declined", description: `${nameOf(c)} · ${c.type}`, type: "info" });
  };

  const stats = canIssue
    ? [
        { label: "Issued", value: issued.length, icon: Award },
        { label: "Pending requests", value: requests.length, icon: Inbox },
        { label: "Recipients", value: new Set(issued.map((c) => c.recipientId)).size, icon: FileSignature },
      ]
    : canRequest
    ? [
        { label: "My requests", value: myRequests.length, icon: Send },
        { label: "Issued", value: myRequests.filter((c) => c.status === "Issued").length, icon: Award },
        { label: "Pending", value: myRequests.filter((c) => c.status === "Requested").length, icon: Clock },
      ]
    : [{ label: "My certificates", value: myCerts.length, icon: Award }];

  return (
    <>
      <PageHeader
        eyebrow="Certificates"
        title={canIssue ? "Certificate Studio" : canRequest ? "Certificates & Requests" : "My Certificates"}
        description={
          canIssue
            ? "Issue any certificate — Completion, Recommendation, Appreciation, Experience or Offer — to anyone in your organization, and action requests from team leads."
            : canRequest
            ? "Request management to issue a certificate for any intern, and track your requests."
            : "Your earned certificates — view and download them anytime."
        }
        actions={
          canIssue ? (
            <Button size="sm" onClick={() => setIssueOpen(true)}><Plus className="h-4 w-4" /> Issue certificate</Button>
          ) : canRequest ? (
            <Button size="sm" onClick={() => setRequestOpen(true)}><Plus className="h-4 w-4" /> Request certificate</Button>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.label} delay={0.05 * i}>
              <Card>
                <Icon className="h-5 w-5 text-mjblue" />
                <p className="mt-3 text-2xl font-bold text-navy">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </Card>
            </Reveal>
          );
        })}
      </div>

      {/* Management/HR: pending requests from leads */}
      {canIssue && (
        <Card className="mb-6">
          <CardHeader title="Requests from team leads" subtitle="Approve to issue the certificate" icon={<Inbox className="h-5 w-5" />} action={<Badge tone="amber">{requests.length} pending</Badge>} />
          {requests.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No pending certificate requests.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((c) => (
                <div key={c.id} className="flex flex-col gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar name={nameOf(c)} url={personById(c.recipientId)?.avatarUrl} className="h-10 w-10" textClassName="text-[11px]" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><Badge tone="blue">{c.type}</Badge><span className="text-[11px] text-slate-400">{c.createdAt}</span></div>
                      <p className="mt-1 text-sm font-semibold text-navy">{nameOf(c)}</p>
                      <p className="text-xs text-slate-500">requested by {personById(c.issuedBy)?.name ?? c.issuedByName}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => decline(c)} className="flex items-center gap-1.5 rounded-xl border border-navy/10 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"><X className="h-3.5 w-3.5" /> Decline</button>
                    <button onClick={() => setView(c)} className="flex items-center gap-1.5 rounded-xl border border-navy/10 bg-white px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/[0.03]">Preview</button>
                    <button onClick={() => issueRequest(c)} className="flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"><Check className="h-3.5 w-3.5" /> Issue</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Lead: my requests */}
      {canRequest && (
        <Card className="mb-6">
          <CardHeader title="My requests" subtitle="Certificates you've requested for interns" icon={<Send className="h-5 w-5" />} />
          {myRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">You haven&apos;t requested any certificates yet.</p>
          ) : (
            <div className="space-y-2.5">
              {myRequests.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={nameOf(c)} url={personById(c.recipientId)?.avatarUrl} className="h-9 w-9" textClassName="text-[11px]" />
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-navy">{nameOf(c)}</p><p className="truncate text-xs text-slate-500">{c.type}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.status === "Issued" && <button onClick={() => setView(c)} className="text-xs font-semibold text-mjblue hover:underline">View</button>}
                    <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* My certificates (recipient) */}
      <Card className="mb-6">
        <CardHeader title="My certificates" subtitle="Issued to you" icon={<Award className="h-5 w-5" />} />
        {myCerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No certificates yet — they&apos;ll appear here once issued to you.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myCerts.map((c) => (
              <div key={c.id} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
                <div className="flex items-center justify-between"><Badge tone="blue">{c.type}</Badge><span className="text-[11px] text-slate-400">{c.createdAt}</span></div>
                <p className="mt-2 text-sm font-semibold text-navy">{c.title}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setView(c)} className="flex-1 rounded-xl bg-navy/5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10">View</button>
                  <button onClick={() => downloadCert(c, user.name)} className="flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3 py-2 text-xs font-semibold text-white"><Download className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Management/HR: all issued */}
      {canIssue && (
        <Card>
          <CardHeader title="Issued certificates" subtitle="Everything issued across the organization" icon={<Award className="h-5 w-5" />} action={<Badge tone="navy">{issued.length}</Badge>} />
          {issued.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nothing issued yet — issue your first certificate above.</p>
          ) : (
            <div className="space-y-2.5">
              {issued.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={nameOf(c)} url={personById(c.recipientId)?.avatarUrl} className="h-9 w-9" textClassName="text-[11px]" />
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-navy">{nameOf(c)}</p><p className="truncate text-xs text-slate-500">{c.type} · {c.createdAt}</p></div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => setView(c)} className="rounded-xl border border-navy/10 bg-white px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/[0.03]">View</button>
                    <button onClick={() => downloadCert(c, nameOf(c))} className="grid h-8 w-8 place-items-center rounded-xl border border-navy/10 bg-white text-navy/70 hover:text-navy" aria-label="Download"><Download className="h-3.5 w-3.5" /></button>
                    <button onClick={() => removeCertificate(c.id)} className="grid h-8 w-8 place-items-center rounded-xl border border-navy/10 bg-white text-rose-500 hover:bg-rose-50" aria-label="Revoke"><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {canIssue && (
        <IssueModal open={issueOpen} onClose={() => setIssueOpen(false)} people={people} issuer={user} onIssue={addCertificate} />
      )}
      {canRequest && (
        <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} interns={internsAll()} requester={user} onRequest={addCertificate} />
      )}

      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={view ? view.title : "Certificate"}
        description={view ? nameOf(view) : ""}
        icon={<Award className="h-5 w-5" />}
        footer={
          view ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setView(null)}>Close</Button>
              <Button size="sm" onClick={() => downloadCert(view, nameOf(view))}><Download className="h-4 w-4" /> Download</Button>
            </>
          ) : null
        }
      >
        {view && <CertificatePreview c={view} name={nameOf(view)} />}
      </Modal>
    </>
  );
}

function IssueModal({ open, onClose, people, issuer, onIssue }: { open: boolean; onClose: () => void; people: Person[]; issuer: Person; onIssue: (c: Certificate) => void }) {
  const { toast } = useToast();
  const [recipientId, setRecipientId] = useState(people[0]?.id ?? "");
  const [type, setType] = useState<CertType>("Completion");
  const [title, setTitle] = useState(certTitle("Completion"));
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [mode, setMode] = useState<"make" | "upload">("make");
  const [file, setFile] = useState<Attachment[]>([]);

  const recipient = people.find((p) => p.id === recipientId);

  useEffect(() => {
    const r = people.find((p) => p.id === recipientId);
    setTitle(certTitle(type));
    setMessage(defaultMessage(r?.name ?? "", type, { team: r?.team }));
  }, [type, recipientId, people]);

  const aiRewrite = async () => {
    if (!recipient) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: recipient.name, role: recipient.title, team: recipient.team, performance: recipient.performance, reliability: recipient.reliability, growth: recipient.growth, type }),
      });
      const data = await res.json();
      if (data.letter) setMessage(data.letter);
      toast({ title: data.source === "live" ? "Rewritten with AI" : "AI draft ready", description: recipient.name, type: "success" });
    } catch {
      toast({ title: "Couldn't reach AI", description: "Keeping the current draft.", type: "error" });
    } finally {
      setAiLoading(false);
    }
  };

  const issue = () => {
    if (!recipient) {
      toast({ title: "Pick a recipient", type: "error" });
      return;
    }
    if (mode === "upload" && !file[0]?.url) {
      toast({ title: "Upload a certificate file", type: "error" });
      return;
    }
    onIssue({
      id: uuid(),
      recipientId,
      recipientName: recipient.name,
      type,
      title: title.trim() || certTitle(type),
      message: mode === "make" ? message.trim() : "",
      issuedBy: issuer.id,
      issuedByName: issuer.name,
      status: "Issued",
      fileUrl: mode === "upload" ? file[0]?.url : undefined,
      fileName: mode === "upload" ? file[0]?.name : undefined,
    });
    burstConfetti();
    toast({ title: "Certificate issued", description: `${recipient.name} · ${type}`, type: "success" });
    onClose();
  };

  const preview: Certificate = {
    id: "preview",
    recipientId,
    recipientName: recipient?.name ?? "",
    type,
    title,
    message,
    issuedBy: issuer.id,
    issuedByName: issuer.name,
    status: "Issued",
    createdAt: "2026",
    fileUrl: mode === "upload" ? file[0]?.url : undefined,
    fileName: mode === "upload" ? file[0]?.name : undefined,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Issue a certificate"
      description="Choose a recipient and type — then issue."
      icon={<Award className="h-5 w-5" />}
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={issue}><Award className="h-4 w-4" /> Issue</Button></>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Recipient</label><select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className={fieldClass}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className={labelClass}>Type</label><select value={type} onChange={(e) => setType(e.target.value as CertType)} className={fieldClass}>{CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>

        <div className="flex rounded-full bg-navy/5 p-1">
          <button type="button" onClick={() => setMode("make")} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "make" ? "bg-white text-navy shadow-card" : "text-navy/50"}`}>Make with platform</button>
          <button type="button" onClick={() => setMode("upload")} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "upload" ? "bg-white text-navy shadow-card" : "text-navy/50"}`}>Upload my own</button>
        </div>

        <div><label className={labelClass}>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} /></div>

        {mode === "make" ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={labelClass + " mb-0"}>Message</label>
              <button onClick={aiRewrite} disabled={aiLoading} className="flex items-center gap-1 rounded-full bg-mjblue-50 px-2.5 py-1 text-[11px] font-bold text-mjblue-700 transition-colors hover:bg-mjblue-100 disabled:opacity-60">
                {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI rewrite
              </button>
            </div>
            <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={textareaClass} />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Certificate file</label>
            <FileDropzone files={file} onChange={setFile} max={1} accept="application/pdf,image/*" hint="Upload a PDF or image of the certificate" />
          </div>
        )}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><FileSignature className="h-3.5 w-3.5" /> Live preview</p>
          <CertificatePreview c={preview} name={recipient?.name ?? "Recipient"} />
        </div>
      </div>
    </Modal>
  );
}

function RequestModal({ open, onClose, interns, requester, onRequest }: { open: boolean; onClose: () => void; interns: Person[]; requester: Person; onRequest: (c: Certificate) => void }) {
  const { toast } = useToast();
  const [recipientId, setRecipientId] = useState(interns[0]?.id ?? "");
  const [type, setType] = useState<CertType>("Completion");
  const [note, setNote] = useState("");

  useEffect(() => {
    const r = interns.find((p) => p.id === recipientId);
    setNote(defaultMessage(r?.name ?? "", type, { team: r?.team }));
  }, [type, recipientId, interns]);

  const request = () => {
    const r = interns.find((p) => p.id === recipientId);
    if (!r) {
      toast({ title: "Pick an intern", type: "error" });
      return;
    }
    onRequest({ id: uuid(), recipientId, recipientName: r.name, type, title: certTitle(type), message: note.trim(), issuedBy: requester.id, issuedByName: requester.name, status: "Requested" });
    toast({ title: "Request sent", description: `Sent to management to issue a ${type} for ${r.name}.`, type: "success" });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request a certificate"
      description="Ask management to issue a certificate for an intern."
      icon={<Send className="h-5 w-5" />}
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={request}><Send className="h-4 w-4" /> Send request</Button></>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Intern</label><select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className={fieldClass}>{interns.length === 0 ? <option value="">No interns yet</option> : interns.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className={labelClass}>Type</label><select value={type} onChange={(e) => setType(e.target.value as CertType)} className={fieldClass}>{CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <div><label className={labelClass}>Note for management <span className="font-normal text-slate-400">(optional)</span></label><textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} className={textareaClass} /></div>
      </div>
    </Modal>
  );
}
