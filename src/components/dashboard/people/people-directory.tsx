"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Mail,
  Phone,
  CalendarDays,
  Users,
  GraduationCap,
  Gauge,
  ListChecks,
  Star,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Reveal } from "@/components/shared/reveal";
import { ScoreBar } from "@/components/shared/charts";
import { fieldClass, labelClass } from "@/components/ui/modal";
import { useApp } from "@/components/app/store";
import { usePeople } from "@/components/app/people";
import { useToast } from "@/components/ui/toast";
import { initials, ROLE_META, type Role } from "@/lib/org";
import { cn } from "@/lib/utils";

const tabs: { key: Role | "all"; label: string }[] = [
  { key: "all", label: "Everyone" },
  { key: "intern", label: "Interns" },
  { key: "lead", label: "Team Leads" },
  { key: "hr", label: "HR Team" },
];
const roleTone: Record<Role, "blue" | "navy" | "sky" | "violet"> = { intern: "blue", lead: "navy", hr: "sky", management: "violet" };
const ROLE_OPTIONS: Role[] = ["intern", "lead", "hr", "management"];

export function PeopleDirectory() {
  const { tasks, feedback, requests } = useApp();
  const { people, loading, internsAll, leadsAll, hrAll, reportsOf, personById, updatePerson } = usePeople();
  const { toast } = useToast();
  const [tab, setTab] = useState<Role | "all">("all");
  const [query, setQuery] = useState("");
  const [selId, setSelId] = useState("");

  const directory = people.filter(
    (p) => (tab === "all" ? p.role !== "management" : p.role === tab) && p.name.toLowerCase().includes(query.toLowerCase())
  );
  const sel = personById(selId) ?? directory[0] ?? people[0];

  const interns = internsAll();
  const avgPerf = interns.length ? Math.round(interns.reduce((s, p) => s + (p.performance ?? 0), 0) / interns.length) : 0;
  const managerOptions = people.filter((p) => p.role !== "intern");

  const summaryKpis = [
    { label: "Total People", value: people.length, icon: <Users className="h-5 w-5" />, spark: [1, 1, 1, 1, 1, people.length] },
    { label: "Interns", value: interns.length, icon: <GraduationCap className="h-5 w-5" />, spark: [0, 0, 1, 1, 1, interns.length] },
    { label: "Avg Intern Perf", value: avgPerf, suffix: "%", icon: <Gauge className="h-5 w-5" />, spark: [0, 0, 0, 0, 0, avgPerf] },
    { label: "Team Leads", value: leadsAll().length, icon: <ShieldCheck className="h-5 w-5" />, spark: [0, 0, 0, 0, 0, leadsAll().length] },
  ];

  const setRole = (id: string, role: Role) => {
    updatePerson(id, { role });
    toast({ title: "Role updated", description: `Set to ${ROLE_META[role].label}.`, type: "success" });
  };
  const setManager = (id: string, managerId: string) => {
    updatePerson(id, { managerId: managerId || undefined });
    toast({ title: "Manager updated", type: "success" });
  };
  const setTeam = (id: string, team: string) => {
    updatePerson(id, { team });
    toast({ title: "Team updated", type: "success" });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryKpis.map((k, i) => (
          <Reveal key={k.label} delay={0.05 * i}>
            <StatCard {...k} />
          </Reveal>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Directory list */}
        <Card className="h-fit">
          <div className="mb-3 flex rounded-full bg-navy/5 p-1 text-xs">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className="relative flex-1 rounded-full px-2 py-1.5 font-semibold transition-colors">
                {tab === t.key && <motion.span layoutId="ppl-tab" className="absolute inset-0 rounded-full bg-white shadow-card" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <span className={cn("relative", tab === t.key ? "text-navy" : "text-navy/50")}>{t.label}</span>
              </button>
            ))}
          </div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people…" className="h-10 w-full rounded-xl border border-navy/8 bg-offwhite/60 pl-9 pr-3 text-sm text-navy outline-none focus:border-mjblue/40 focus:ring-4 focus:ring-mjblue/10" />
          </div>
          <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
            {directory.map((p) => (
              <button key={p.id} onClick={() => setSelId(p.id)} className={cn("flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all", p.id === sel?.id ? "border-mjblue/30 bg-mjblue-50/60" : "border-transparent hover:bg-navy/[0.03]")}>
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials(p.name)}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-navy">{p.name}</p><p className="truncate text-[11px] text-slate-500">{p.title}</p></div>
                <Badge tone={roleTone[p.role]}>{ROLE_META[p.role].short}</Badge>
              </button>
            ))}
            {directory.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">
                {loading ? "Loading people…" : "No one here yet. People appear after they sign in — then assign their role below."}
              </p>
            )}
          </div>
        </Card>

        {/* Detail */}
        {sel ? (
          <AnimatePresence mode="wait">
            <motion.div key={sel.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="space-y-4">
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-xl font-bold text-white">{initials(sel.name)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-navy">{sel.name}</h3>
                      <p className="text-sm text-slate-500">{sel.title}{sel.team ? ` · ${sel.team}` : ""}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {sel.email}</span>
                        {sel.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {sel.phone}</span>}
                        {sel.joined && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {sel.joined}</span>}
                      </div>
                    </div>
                  </div>
                  <Badge tone={roleTone[sel.role]}>{ROLE_META[sel.role].label}</Badge>
                </div>
                {sel.managerId && (
                  <p className="mt-4 text-xs text-slate-500">Reports to <span className="font-semibold text-navy">{personById(sel.managerId)?.name ?? "—"}</span></p>
                )}
              </Card>

              {/* Admin: assign role / team / manager */}
              <Card>
                <CardHeader title="Manage access" subtitle="Assign role, team & reporting line" icon={<UserCog className="h-5 w-5" />} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Role</label>
                    <select value={sel.role} onChange={(e) => setRole(sel.id, e.target.value as Role)} className={fieldClass}>
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Team</label>
                    <input key={sel.id} defaultValue={sel.team ?? ""} onBlur={(e) => { if (e.target.value !== (sel.team ?? "")) setTeam(sel.id, e.target.value); }} placeholder="e.g. Growth" className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Reports to</label>
                    <select value={sel.managerId ?? ""} onChange={(e) => setManager(sel.id, e.target.value)} className={fieldClass}>
                      <option value="">— None —</option>
                      {managerOptions.filter((m) => m.id !== sel.id).map((m) => <option key={m.id} value={m.id}>{m.name} ({ROLE_META[m.role].short})</option>)}
                    </select>
                  </div>
                </div>
              </Card>

              {sel.role === "intern" ? <InternDetail id={sel.id} /> : <ManagerDetail id={sel.id} />}
            </motion.div>
          </AnimatePresence>
        ) : (
          <Card className="grid place-items-center py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mjblue-50 text-mjblue"><Users className="h-6 w-6" /></div>
            <h3 className="text-lg font-bold text-navy">Your team will appear here</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">As people sign in to MJ Nexus they show up in this directory. Select someone to view their data and assign their role, team, and manager.</p>
          </Card>
        )}
      </div>
    </div>
  );

  function InternDetail({ id }: { id: string }) {
    const p = personById(id)!;
    const theirTasks = tasks.filter((t) => t.assigneeId === id);
    const theirFeedback = feedback.filter((f) => f.internId === id);
    const done = theirTasks.filter((t) => t.status === "Approved").length;
    return (
      <>
        <Card>
          <CardHeader title="Performance indices" subtitle="Individual metrics" icon={<Gauge className="h-5 w-5" />} />
          <div className="grid gap-4 sm:grid-cols-2">
            <ScoreBar label="Performance" value={p.performance ?? 0} />
            <ScoreBar label="Reliability" value={p.reliability ?? 0} />
            <ScoreBar label="Growth" value={p.growth ?? 0} />
            <ScoreBar label="Attendance" value={p.attendance ?? 0} />
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="h-full">
            <CardHeader title="Tasks" subtitle={`${done}/${theirTasks.length} approved`} icon={<ListChecks className="h-5 w-5" />} />
            <div className="space-y-2">
              {theirTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl border border-navy/5 bg-offwhite/60 p-2.5">
                  <p className="min-w-0 truncate text-sm text-navy">{t.title}</p>
                  <Badge tone={t.status === "Approved" ? "green" : t.status === "Submitted" ? "amber" : "slate"}>{t.status}</Badge>
                </div>
              ))}
              {theirTasks.length === 0 && <p className="py-3 text-center text-sm text-slate-400">No tasks yet.</p>}
            </div>
          </Card>
          <Card className="h-full">
            <CardHeader title="Feedback" subtitle="From their lead" icon={<Star className="h-5 w-5" />} />
            <div className="space-y-2">
              {theirFeedback.map((f) => (
                <div key={f.id} className="rounded-xl border border-navy/5 bg-offwhite/60 p-2.5">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold text-navy">{personById(f.fromId)?.name ?? "—"}</span><span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</span></div>
                  <p className="mt-1 text-xs text-navy/70">{f.note}</p>
                </div>
              ))}
              {theirFeedback.length === 0 && <p className="py-3 text-center text-sm text-slate-400">No feedback yet.</p>}
            </div>
          </Card>
        </div>
      </>
    );
  }

  function ManagerDetail({ id }: { id: string }) {
    const team = reportsOf(id);
    const avg = team.length ? Math.round(team.reduce((s, r) => s + (r.performance ?? 0), 0) / team.length) : 0;
    const assigned = tasks.filter((t) => t.assignerId === id).length;
    const handled = requests.filter((r) => r.approverId === id).length;
    return (
      <>
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center"><p className="text-2xl font-bold text-navy">{team.length}</p><p className="text-xs text-slate-500">Direct reports</p></Card>
          <Card className="text-center"><p className="text-2xl font-bold text-navy">{avg}%</p><p className="text-xs text-slate-500">Team avg perf</p></Card>
          <Card className="text-center"><p className="text-2xl font-bold text-navy">{assigned}</p><p className="text-xs text-slate-500">Tasks assigned</p></Card>
        </div>
        <Card>
          <CardHeader title="Direct reports" subtitle={`${team.length} people · ${handled} approvals handled`} icon={<Users className="h-5 w-5" />} />
          <div className="grid gap-3 sm:grid-cols-2">
            {team.map((r) => (
              <button key={r.id} onClick={() => setSelId(r.id)} className="flex items-center gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-card">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials(r.name)}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-navy">{r.name}</p><p className="truncate text-xs text-slate-500">{r.title}</p></div>
                <span className="text-sm font-bold text-navy">{r.performance ?? "—"}</span>
              </button>
            ))}
            {team.length === 0 && <p className="py-3 text-center text-sm text-slate-400 sm:col-span-2">No direct reports yet — assign someone&apos;s manager to this person.</p>}
          </div>
        </Card>
      </>
    );
  }
}
