"use client";

import Link from "next/link";
import {
  Users,
  Gauge,
  ClipboardCheck,
  Inbox,
  FileCheck2,
  ArrowUpRight,
  Paperclip,
} from "lucide-react";
import { Greeting } from "@/components/dashboard/home/greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { useAuth } from "@/components/app/auth";
import { useApp } from "@/components/app/store";
import { initials } from "@/lib/org";
import { usePeople } from "@/components/app/people";

export function LeadHome() {
  const { user } = useAuth();
  const { tasks, submissions, requests } = useApp();
  const { reportsOf, personById } = usePeople();

  const reports = reportsOf(user.id);
  const pendingSubs = submissions.filter((s) => {
    const task = tasks.find((t) => t.id === s.taskId);
    return task?.assignerId === user.id && s.status === "Pending Review";
  });
  const pendingApprovals = requests.filter((r) => r.approverId === user.id && r.status === "Pending");
  const avgPerf = reports.length ? Math.round(reports.reduce((s, r) => s + (r.performance ?? 0), 0) / reports.length) : 0;

  const kpis = [
    { label: "Team Members", value: reports.length, icon: <Users className="h-5 w-5" />, spark: [reports.length, reports.length, reports.length, reports.length, reports.length, reports.length] },
    { label: "Avg Performance", value: avgPerf, suffix: "%", delta: "+2.1%", icon: <Gauge className="h-5 w-5" />, spark: [avgPerf - 5, avgPerf - 3, avgPerf - 2, avgPerf - 1, avgPerf, avgPerf] },
    { label: "Pending Reviews", value: pendingSubs.length, icon: <FileCheck2 className="h-5 w-5" />, spark: [3, 3, 2, 2, pendingSubs.length, pendingSubs.length] },
    { label: "Approvals", value: pendingApprovals.length, icon: <Inbox className="h-5 w-5" />, spark: [2, 2, 1, 1, pendingApprovals.length, pendingApprovals.length] },
  ];

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={0.05 * i}><StatCard {...k} /></Reveal>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2" delay={0.05}>
          <Card className="h-full">
            <CardHeader
              title="Submissions to review"
              subtitle="Approve work or request changes"
              icon={<ClipboardCheck className="h-5 w-5" />}
              action={<Link href="/dashboard/workspace" className="text-xs font-semibold text-mjblue hover:underline">Open reviews</Link>}
            />
            <div className="space-y-2.5">
              {pendingSubs.map((s) => {
                const task = tasks.find((t) => t.id === s.taskId);
                return (
                  <Link key={s.id} href="/dashboard/workspace" className="flex items-center justify-between gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5 transition-colors hover:border-mjblue/20">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials(personById(s.internId)?.name ?? "")}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">{task?.title}</p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          {personById(s.internId)?.name}
                          {s.files.length > 0 && <span className="flex items-center gap-0.5"><Paperclip className="h-3 w-3" /> {s.files.length}</span>}
                        </p>
                      </div>
                    </div>
                    <Badge tone="amber">Review</Badge>
                  </Link>
                );
              })}
              {pendingSubs.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No submissions waiting. 🎉</p>}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader title="Approvals inbox" subtitle="Requests from your team" icon={<Inbox className="h-5 w-5" />} action={<Link href="/dashboard/approvals" className="text-xs font-semibold text-mjblue hover:underline">All</Link>} />
            <div className="space-y-2.5">
              {pendingApprovals.map((r) => (
                <Link key={r.id} href="/dashboard/approvals" className="block rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5 transition-colors hover:border-mjblue/20">
                  <div className="flex items-center justify-between">
                    <Badge tone="blue">{r.type}</Badge>
                    <span className="text-[11px] text-slate-400">{r.createdAt}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-navy">{r.title}</p>
                  <p className="text-xs text-slate-500">from {personById(r.requesterId)?.name}</p>
                </Link>
              ))}
              {pendingApprovals.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Inbox zero ✨</p>}
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <Card>
          <CardHeader title="My team" subtitle={`${user.team} pod performance`} icon={<Users className="h-5 w-5" />} action={<Link href="/dashboard/team" className="text-xs font-semibold text-mjblue hover:underline">Manage team</Link>} />
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map((r) => (
              <Link key={r.id} href="/dashboard/team" className="flex items-center gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">{initials(r.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">{r.name}</p>
                  <p className="truncate text-xs text-slate-500">{r.title}</p>
                </div>
                <div className="w-24 shrink-0">
                  <div className="mb-1 flex justify-between text-[11px]"><span className="text-slate-400">Perf</span><span className="font-semibold text-navy">{r.performance}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-navy/[0.06]"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${r.performance}%` }} /></div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
