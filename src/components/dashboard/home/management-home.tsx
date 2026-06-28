"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  Gauge,
  Award,
  Inbox,
  UsersRound,
  Radar as RadarIcon,
  TrendingUp,
  TriangleAlert,
  ArrowUpRight,
} from "lucide-react";
import { Greeting } from "@/components/dashboard/home/greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { RadarCompare } from "@/components/dashboard/charts";
import { useApp } from "@/components/app/store";
import { initials } from "@/lib/org";
import { Avatar } from "@/components/shared/avatar";
import { usePeople } from "@/components/app/people";
import { useAuth } from "@/components/app/auth";

const kpiIcons = [<Users key="u" className="h-5 w-5" />, <GraduationCap key="g" className="h-5 w-5" />, <Gauge key="p" className="h-5 w-5" />, <Award key="a" className="h-5 w-5" />];

export function ManagementHome() {
  const { requests, tasks } = useApp();
  const { user } = useAuth();
  const { people, internsAll, leadsAll, hrAll, personById } = usePeople();
  const queue = requests.filter((r) => r.approverId === user.id && r.status === "Pending");
  const interns = internsAll();
  const ranked = [...interns].sort((a, b) => (b.performance ?? 0) - (a.performance ?? 0));
  const top = ranked[0];
  const atRisk = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;

  const avgPerf = interns.length ? Math.round(interns.reduce((s, p) => s + (p.performance ?? 0), 0) / interns.length) : 0;
  const tasksApproved = tasks.filter((t) => t.status === "Approved").length;
  const deptCount = new Set(people.map((p) => p.team).filter(Boolean)).size;

  const kpis = [
    { label: "Team Members", value: people.length },
    { label: "Interns", value: interns.length },
    { label: "Avg Performance", value: avgPerf },
    { label: "Tasks Approved", value: tasksApproved },
  ];

  const org = [
    { label: "Team Leads", value: leadsAll().length, icon: UsersRound },
    { label: "HR Team", value: hrAll().length, icon: Users },
    { label: "Interns", value: interns.length, icon: GraduationCap },
    { label: "Departments", value: deptCount, icon: TrendingUp },
  ];

  // Real department radar - average indices per team (top 3 teams by headcount).
  const teamNames = Array.from(new Set(interns.map((i) => i.team).filter(Boolean))) as string[];
  const topTeams = teamNames.slice(0, 3);
  const avgFor = (team: string, key: "performance" | "reliability" | "growth" | "attendance") => {
    const g = interns.filter((i) => i.team === team);
    return g.length ? Math.round(g.reduce((s, p) => s + (p[key] ?? 0), 0) / g.length) : 0;
  };
  const radarData = (["performance", "reliability", "growth", "attendance"] as const).map((key) => ({
    metric: key.charAt(0).toUpperCase() + key.slice(1),
    ...Object.fromEntries(topTeams.map((t) => [t, avgFor(t, key)])),
  }));
  const radarColors = ["#1D7FFF", "#0A6BEF", "#6BC5FF"];
  const radarSeries = topTeams.map((t, i) => ({ key: t, color: radarColors[i % 3] }));

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={0.05 * i}>
            <StatCard label={k.label} value={k.value} icon={kpiIcons[i]} />
          </Reveal>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2" delay={0.05}>
          <Card className="h-full">
            <CardHeader title="Department comparison" subtitle="Performance · retention · engagement" icon={<RadarIcon className="h-5 w-5" />} action={<Link href="/dashboard/analytics" className="text-xs font-semibold text-mjblue hover:underline">Full analytics</Link>} />
            {topTeams.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">No team performance data yet - add interns with teams to compare.</p>
            ) : (
              <RadarCompare data={radarData} series={radarSeries} height={300} />
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader title="Approvals queue" subtitle="Awaiting your sign-off" icon={<Inbox className="h-5 w-5" />} action={<Link href="/dashboard/approvals" className="text-xs font-semibold text-mjblue hover:underline">Review</Link>} />
            <div className="space-y-2.5">
              {queue.map((r) => (
                <Link key={r.id} href="/dashboard/approvals" className="block rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5 transition-colors hover:border-mjblue/20">
                  <div className="flex items-center justify-between"><Badge tone="violet">{r.type}</Badge><span className="text-[11px] text-slate-400">{r.createdAt}</span></div>
                  <p className="mt-1.5 text-sm font-semibold text-navy">{r.title}</p>
                  <p className="text-xs text-slate-500">from {personById(r.requesterId)?.name}</p>
                </Link>
              ))}
              {queue.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Queue clear ✨</p>}
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-1" delay={0.05}>
          <Card className="h-full">
            <CardHeader title="Organization" subtitle="At a glance" icon={<UsersRound className="h-5 w-5" />} action={<Link href="/dashboard/people" className="text-xs font-semibold text-mjblue hover:underline">Directory</Link>} />
            <div className="grid grid-cols-2 gap-3">
              {org.map((o) => {
                const Icon = o.icon;
                return (
                  <div key={o.label} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
                    <Icon className="h-5 w-5 text-mjblue" />
                    <p className="mt-2 text-2xl font-bold text-navy">{o.value}</p>
                    <p className="text-xs text-slate-500">{o.label}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0.1}>
          <Card className="h-full">
            <CardHeader title="People to watch" subtitle="Drill into anyone in the directory" icon={<Users className="h-5 w-5" />} action={<Link href="/dashboard/people" className="text-xs font-semibold text-mjblue hover:underline">Open People</Link>} />
            {top ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/dashboard/people" className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 transition-transform hover:-translate-y-0.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><TrendingUp className="h-3.5 w-3.5" /> Top performer</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar name={top.name} url={top.avatarUrl} className="h-10 w-10" />
                    <div><p className="text-sm font-semibold text-navy">{top.name}</p><p className="text-xs text-slate-500">{top.title} · {top.performance ?? "-"}</p></div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-emerald-500" />
                  </div>
                </Link>
                {atRisk && (
                <Link href="/dashboard/people" className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 transition-transform hover:-translate-y-0.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700"><TriangleAlert className="h-3.5 w-3.5" /> Needs attention</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar name={atRisk.name} url={atRisk.avatarUrl} className="h-10 w-10" />
                    <div><p className="text-sm font-semibold text-navy">{atRisk.name}</p><p className="text-xs text-slate-500">{atRisk.title} · {atRisk.performance ?? "-"}</p></div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-amber-500" />
                  </div>
                </Link>
                )}
              </div>
            ) : (
              <Link href="/dashboard/people" className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-navy/10 py-10 text-sm font-medium text-mjblue">
                No interns yet - open People to add your team <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
