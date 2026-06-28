"use client";

import Link from "next/link";
import {
  Users,
  Filter,
  Video,
  CheckCircle2,
  Inbox,
  ArrowUpRight,
  UserPlus,
} from "lucide-react";
import { Greeting } from "@/components/dashboard/home/greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { useAuth } from "@/components/app/auth";
import { useApp } from "@/components/app/store";
import { initials } from "@/lib/org";
import { usePeople } from "@/components/app/people";
import { useRecruitment } from "@/components/dashboard/recruitment-context";
import { useInterviews } from "@/components/dashboard/interviews-context";

const reqTone: Record<string, "amber" | "green" | "red"> = { Pending: "amber", Approved: "green", Rejected: "red" };

export function HrHome() {
  const { user } = useAuth();
  const { requests } = useApp();
  const { reportsOf, personById } = usePeople();
  const { candidates } = useRecruitment();
  const { interviews } = useInterviews();

  const myReports = reportsOf(user.id);
  const myInitiated = requests.filter((r) => r.requesterId === user.id);
  const upcoming = interviews.filter((i) => i.status === "Upcoming");

  const total = candidates.length;
  const inStage = (arr: string[]) => candidates.filter((c) => arr.includes(c.stage)).length;
  const recruitmentFunnel = [
    { stage: "Applied", value: total },
    { stage: "Under Review", value: inStage(["Under Review", "Interview Scheduled", "Selected", "Onboarded"]) },
    { stage: "Interview", value: inStage(["Interview Scheduled", "Selected", "Onboarded"]) },
    { stage: "Selected", value: inStage(["Selected", "Onboarded"]) },
    { stage: "Onboarded", value: inStage(["Onboarded"]) },
  ];
  const maxFunnel = recruitmentFunnel[0].value || 1;
  const rate = (n: number) => (total ? Math.round((n / total) * 1000) / 10 : 0);

  const kpis = [
    { label: "Total Applicants", value: total, icon: <Users className="h-5 w-5" /> },
    { label: "Shortlisting Rate", value: rate(recruitmentFunnel[1].value), suffix: "%", decimals: 1, icon: <Filter className="h-5 w-5" /> },
    { label: "Interviews", value: interviews.length, icon: <Video className="h-5 w-5" /> },
    { label: "Hiring Rate", value: rate(recruitmentFunnel[4].value), suffix: "%", decimals: 1, icon: <CheckCircle2 className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <Reveal><Greeting subtitle="Recruitment, onboarding & certification" /></Reveal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={0.05 * i}><StatCard {...k} /></Reveal>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal delay={0.05}>
          <Card className="h-full">
            <CardHeader title="Candidate pipeline" subtitle="Applied → Onboarded" icon={<Filter className="h-5 w-5" />} action={<Link href="/dashboard/recruitment" className="text-xs font-semibold text-mjblue hover:underline">Open</Link>} />
            <div className="space-y-3">
              {recruitmentFunnel.map((f, i) => {
                const pct = Math.round((f.value / maxFunnel) * 100);
                return (
                  <div key={f.stage}>
                    <div className="mb-1 flex items-center justify-between text-sm"><span className="text-slate-600">{f.stage}</span><span className="font-semibold text-navy tabular-nums">{f.value}</span></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-navy/[0.06]"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${pct}%`, opacity: 1 - i * 0.12 }} /></div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader title="Upcoming interviews" subtitle="This week" icon={<Video className="h-5 w-5" />} action={<Link href="/dashboard/interviews" className="text-xs font-semibold text-mjblue hover:underline">Scheduler</Link>} />
            <div className="space-y-2.5">
              {upcoming.map((iv) => (
                <div key={iv.id} className="flex items-center gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">{initials(iv.candidate)}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-navy">{iv.candidate}</p><p className="text-xs text-slate-500">{iv.date.slice(5)} · {iv.time}</p></div>
                  <Badge tone="sky">{iv.mode}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="h-full">
            <CardHeader title="My approvals" subtitle="Sent to management" icon={<Inbox className="h-5 w-5" />} action={<Link href="/dashboard/approvals" className="text-xs font-semibold text-mjblue hover:underline">Initiate</Link>} />
            <div className="space-y-2.5">
              {myInitiated.map((r) => (
                <div key={r.id} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5">
                  <div className="flex items-center justify-between"><Badge tone="blue">{r.type}</Badge><Badge tone={reqTone[r.status]}>{r.status}</Badge></div>
                  <p className="mt-1.5 text-sm font-semibold text-navy">{r.title}</p>
                </div>
              ))}
              {myInitiated.length === 0 && (
                <Link href="/dashboard/approvals" className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-navy/10 py-6 text-sm font-medium text-mjblue">Initiate a request <ArrowUpRight className="h-4 w-4" /></Link>
              )}
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <Card>
          <CardHeader title="People Ops interns" subtitle="Interns you manage directly" icon={<UserPlus className="h-5 w-5" />} />
          <div className="grid gap-3 sm:grid-cols-2">
            {myReports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-navy/5 bg-offwhite/60 p-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">{initials(r.name)}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-navy">{r.name}</p><p className="truncate text-xs text-slate-500">{r.title}</p></div>
                <span className="text-sm font-bold text-navy">{r.performance}</span>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
