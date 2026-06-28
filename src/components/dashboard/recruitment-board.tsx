"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, MapPin, Sparkles, Mail, Briefcase, CalendarDays, FileText, Download, Award } from "lucide-react";
import {
  STAGE_META,
  ROLE_COLORS,
  initials,
  type Role,
  type Candidate,
} from "@/lib/data";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useRecruitment } from "@/components/dashboard/recruitment-context";
import { cn } from "@/lib/utils";

const roleFilters = ["All", "Marketing", "Sales", "HR"] as const;

function scoreTone(score: number) {
  if (score >= 90) return "bg-emerald-50 text-emerald-600";
  if (score >= 80) return "bg-mjblue-50 text-mjblue-700";
  if (score >= 70) return "bg-amber-50 text-amber-600";
  return "bg-slate-100 text-slate-500";
}

function buildCV(c: Candidate): string {
  return [
    c.name.toUpperCase(),
    `${c.role} Intern Candidate`,
    `Email: ${c.email}`,
    `Location: ${c.state}`,
    "",
    "EDUCATION",
    `  ${c.college}`,
    "",
    "EXPERIENCE",
    `  ${c.experience}`,
    "",
    "SKILLS",
    `  ${c.skills.join(", ")}`,
    "",
    "APPLICATION",
    `  Source: ${c.source}`,
    `  Applied: ${c.appliedDate}`,
    `  AI Fit Score: ${c.fitScore}/100`,
  ].join("\n");
}

function downloadCV(c: Candidate) {
  if (typeof window === "undefined") return;
  const blob = new Blob([buildCV(c)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${c.name.replace(/\s+/g, "_")}_CV.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const isImageName = (n?: string) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(n ?? "");

export function RecruitmentBoard() {
  const { candidates: allCandidates } = useRecruitment();
  const [role, setRole] = useState<(typeof roleFilters)[number]>("All");
  const [detail, setDetail] = useState<Candidate | null>(null);
  const filtered =
    role === "All" ? allCandidates : allCandidates.filter((c) => c.role === role);

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {roleFilters.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
              role === r
                ? "bg-navy text-white shadow-card"
                : "border border-navy/8 bg-white text-navy/60 hover:text-navy"
            )}
          >
            {r}
            {r !== "All" && (
              <span className="ml-1.5 text-xs opacity-60">
                {allCandidates.filter((c) => c.role === r).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
        {STAGE_META.map((col) => {
          const items = filtered.filter((c) => c.stage === col.key);
          return (
            <div key={col.key} className="w-[284px] shrink-0">
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-navy/5 bg-white px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: col.color }}
                  />
                  <span className="text-sm font-semibold text-navy">{col.label}</span>
                </div>
                <span className="rounded-full bg-navy/5 px-2 py-0.5 text-xs font-bold text-navy/60">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((c) => (
                    <motion.div
                      layout
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -3 }}
                      onClick={() => setDetail(c)}
                      className="group cursor-pointer rounded-2xl border border-navy/5 bg-white p-3.5 shadow-card transition-shadow hover:shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">
                            {initials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-navy">
                              {c.name}
                            </p>
                            <span
                              className="text-[11px] font-medium"
                              style={{ color: ROLE_COLORS[c.role as Role] }}
                            >
                              {c.role}
                            </span>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                            scoreTone(c.fitScore)
                          )}
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          {c.fitScore}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
                        <p className="flex items-center gap-1.5">
                          <GraduationCap className="h-3 w-3" /> {c.college}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" /> {c.state} · {c.source}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-navy/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-navy/60"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {items.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-navy/10 py-8 text-center text-xs text-slate-400">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CandidateModal candidate={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-navy/5 bg-white p-3">
      <span className="mt-0.5 text-mjblue">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
        <p className="truncate font-medium text-navy">{value}</p>
      </div>
    </div>
  );
}

function CVSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-mjblue">{title}</p>
      <p className="mt-0.5 text-sm text-navy/70">{children}</p>
    </div>
  );
}

function CandidateModal({ candidate: c, onClose }: { candidate: Candidate | null; onClose: () => void }) {
  return (
    <Modal
      open={!!c}
      onClose={onClose}
      title={c?.name ?? "Candidate"}
      description={c ? `${c.role} candidate · ${c.stage}` : ""}
      icon={<FileText className="h-5 w-5" />}
      footer={
        c ? (
          <>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            {c.resumeUrl ? (
              <Button size="sm" onClick={() => window.open(c.resumeUrl!, "_blank", "noopener,noreferrer")}><Download className="h-4 w-4" /> Open CV</Button>
            ) : (
              <Button size="sm" onClick={() => downloadCV(c)}><Download className="h-4 w-4" /> Download CV</Button>
            )}
          </>
        ) : null
      }
    >
      {c && (
        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-brand text-base font-bold text-white">{initials(c.name)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-navy">{c.name}</p>
              <p className="text-sm font-medium" style={{ color: ROLE_COLORS[c.role] }}>{c.role}</p>
            </div>
            <div className="text-center">
              <p className={cn("rounded-xl px-3 py-1.5 text-lg font-bold", scoreTone(c.fitScore))}>{c.fitScore}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">AI fit</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Detail icon={<Mail className="h-4 w-4" />} label="Email" value={c.email} />
            <Detail icon={<MapPin className="h-4 w-4" />} label="Location" value={c.state} />
            <Detail icon={<GraduationCap className="h-4 w-4" />} label="College" value={c.college} />
            <Detail icon={<Briefcase className="h-4 w-4" />} label="Experience" value={c.experience} />
            <Detail icon={<Award className="h-4 w-4" />} label="Source" value={c.source} />
            <Detail icon={<CalendarDays className="h-4 w-4" />} label="Applied" value={c.appliedDate} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {c.skills.map((s) => <span key={s} className="rounded-lg bg-mjblue-50 px-2.5 py-1 text-xs font-medium text-mjblue-700">{s}</span>)}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><FileText className="h-3.5 w-3.5" /> Resume / CV</p>
            {c.resumeUrl ? (
              <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-card">
                {isImageName(c.resumeName) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.resumeUrl} alt={c.resumeName ?? "Resume"} className="max-h-80 w-full rounded-xl bg-offwhite/60 object-contain" />
                ) : (
                  <div className="flex items-center gap-3 rounded-xl bg-offwhite/60 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mjblue-50 text-mjblue"><FileText className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">{c.resumeName ?? "Resume.pdf"}</p>
                      <p className="text-xs text-slate-500">Uploaded CV</p>
                    </div>
                  </div>
                )}
                <button onClick={() => window.open(c.resumeUrl!, "_blank", "noopener,noreferrer")} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy/5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10">
                  <Download className="h-3.5 w-3.5" /> Open CV in new tab
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
                <div className="border-b border-navy/10 pb-3">
                  <p className="text-base font-bold text-navy">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.role} Intern Candidate · {c.email}</p>
                </div>
                <CVSection title="Education">{c.college}</CVSection>
                <CVSection title="Experience">{c.experience}</CVSection>
                <CVSection title="Skills">{c.skills.join(" · ")}</CVSection>
                <CVSection title="Application">{c.source} · Applied {c.appliedDate} · AI Fit {c.fitScore}/100</CVSection>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
