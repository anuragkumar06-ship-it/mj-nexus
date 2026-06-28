"use client";

import Link from "next/link";
import {
  Gauge,
  ShieldCheck,
  TrendingUp,
  CalendarCheck,
  Briefcase,
  Star,
  Inbox,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import { Greeting } from "@/components/dashboard/home/greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { ProgressRing } from "@/components/shared/progress-ring";
import { useAuth } from "@/components/app/auth";
import { useApp } from "@/components/app/store";
import { personById } from "@/lib/org";
import { learningResources } from "@/lib/data";

const taskTone: Record<string, "slate" | "blue" | "amber" | "green"> = {
  "To Do": "slate",
  "In Progress": "blue",
  Submitted: "amber",
  Approved: "green",
};
const reqTone: Record<string, "amber" | "green" | "red"> = {
  Pending: "amber",
  Approved: "green",
  Rejected: "red",
};

export function InternHome() {
  const { user } = useAuth();
  const { tasks, feedback, requests } = useApp();

  const myTasks = tasks.filter((t) => t.assigneeId === user.id);
  const active = myTasks.filter((t) => t.status !== "Approved");
  const myFeedback = feedback.filter((f) => f.internId === user.id);
  const myRequests = requests.filter((r) => r.requesterId === user.id);

  const kpis = [
    { label: "Performance", value: user.performance ?? 0, suffix: "%", delta: "+2.4%", icon: <Gauge className="h-5 w-5" />, spark: [82, 84, 86, 88, 90, user.performance ?? 0] },
    { label: "Reliability", value: user.reliability ?? 0, suffix: "%", delta: "+1.8%", icon: <ShieldCheck className="h-5 w-5" />, spark: [88, 90, 92, 94, 96, user.reliability ?? 0] },
    { label: "Growth", value: user.growth ?? 0, suffix: "%", delta: "+3.2%", icon: <TrendingUp className="h-5 w-5" />, spark: [80, 83, 85, 88, 90, user.growth ?? 0] },
    { label: "Attendance", value: user.attendance ?? 0, suffix: "%", icon: <CalendarCheck className="h-5 w-5" />, spark: [92, 94, 95, 97, 98, user.attendance ?? 0] },
  ];

  return (
    <div className="space-y-6">
      <Reveal><Greeting subtitle={`${active.length} active tasks · ${user.team} team`} /></Reveal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={0.05 * i}><StatCard {...k} /></Reveal>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2" delay={0.05}>
          <Card className="h-full">
            <CardHeader
              title="My active tasks"
              subtitle="Submit your work with screenshots & files"
              icon={<Briefcase className="h-5 w-5" />}
              action={<Link href="/dashboard/workspace" className="text-xs font-semibold text-mjblue hover:underline">Open My Work</Link>}
            />
            <div className="space-y-2.5">
              {active.map((t) => (
                <Link
                  key={t.id}
                  href="/dashboard/workspace"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5 transition-colors hover:border-mjblue/20"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.tag} · due {t.due}</p>
                  </div>
                  <Badge tone={taskTone[t.status]}>{t.status}</Badge>
                </Link>
              ))}
              {active.length === 0 && <p className="py-6 text-center text-sm text-slate-400">All caught up 🎉</p>}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="flex h-full flex-col items-center justify-center text-center">
            <ProgressRing value={user.performance ?? 0} size={150} stroke={13}>
              <div>
                <p className="text-3xl font-bold text-navy">{user.performance}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Performance</p>
              </div>
            </ProgressRing>
            <p className="mt-4 text-sm font-semibold text-navy">You're doing great, {user.name.split(" ")[0]}!</p>
            <p className="mt-1 text-xs text-slate-500">Top {user.performance && user.performance >= 90 ? "10%" : "25%"} of interns this month</p>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.05}>
          <Card className="h-full">
            <CardHeader title="Latest feedback" subtitle="From your team lead" icon={<Star className="h-5 w-5" />} />
            <div className="space-y-3">
              {myFeedback.map((f) => (
                <div key={f.id} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-navy">{personById(f.fromId)?.name}</span>
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-navy/70">{f.note}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{f.date}</p>
                </div>
              ))}
              {myFeedback.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No feedback yet.</p>}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader
              title="My requests"
              subtitle="Leave, extensions & resources"
              icon={<Inbox className="h-5 w-5" />}
              action={<Link href="/dashboard/approvals" className="text-xs font-semibold text-mjblue hover:underline">Raise request</Link>}
            />
            <div className="space-y-2.5">
              {myRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.type} · to {personById(r.approverId)?.name}</p>
                  </div>
                  <Badge tone={reqTone[r.status]}>{r.status}</Badge>
                </div>
              ))}
              {myRequests.length === 0 && (
                <Link href="/dashboard/approvals" className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-navy/10 py-6 text-sm font-medium text-mjblue">
                  Raise your first request <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <Card>
          <CardHeader title="Continue learning" subtitle="Curated paths for your growth" icon={<GraduationCap className="h-5 w-5" />} action={<Link href="/dashboard/learning" className="text-xs font-semibold text-mjblue hover:underline">View all</Link>} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {learningResources.map((l) => (
              <div key={l.id} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
                <p className="text-sm font-semibold leading-snug text-navy">{l.title}</p>
                <p className="mt-1 text-xs text-slate-400">{l.lessons} lessons · {l.level}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/[0.06]">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${l.progress}%` }} />
                </div>
                <p className="mt-1 text-right text-[11px] font-semibold text-navy">{l.progress}%</p>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
