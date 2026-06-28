"use client";

import { Star, Trophy } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { ProgressRing } from "@/components/shared/progress-ring";
import { ScoreBar } from "@/components/shared/charts";
import { PerformanceCompare } from "@/components/dashboard/performance-compare";
import { useAuth } from "@/components/app/auth";
import { useApp } from "@/components/app/store";
import { type Person } from "@/lib/org";
import { usePeople } from "@/components/app/people";

const avg = (arr: Person[], key: "performance" | "reliability" | "growth") =>
  arr.length ? Math.round(arr.reduce((s, p) => s + (p[key] ?? 0), 0) / arr.length) : 0;

export default function PerformancePage() {
  const { user, role } = useAuth();
  const { feedback } = useApp();
  const { internsAll, reportsOf, personById } = usePeople();

  if (role === "intern") {
    const myFeedback = feedback.filter((f) => f.internId === user.id);
    const all = [...internsAll()].sort((a, b) => (b.performance ?? 0) - (a.performance ?? 0));
    const rank = all.findIndex((p) => p.id === user.id) + 1;
    const rings = [
      { label: "Performance", value: user.performance ?? 0, from: "#1D7FFF", to: "#6BC5FF" },
      { label: "Reliability", value: user.reliability ?? 0, from: "#0A6BEF", to: "#6BC5FF" },
      { label: "Growth", value: user.growth ?? 0, from: "#1D7FFF", to: "#93D5FF" },
    ];
    return (
      <>
        <PageHeader eyebrow="Performance" title="My Performance" description="Your performance, reliability, and growth indices — with feedback from your team lead." />
        <div className="grid gap-4 sm:grid-cols-3">
          {rings.map((r, i) => (
            <Reveal key={r.label} delay={0.05 * i}>
              <Card className="flex h-full flex-col items-center text-center">
                <ProgressRing value={r.value} size={132} stroke={12} from={r.from} to={r.to}><div><p className="text-2xl font-bold text-navy">{r.value}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">/ 100</p></div></ProgressRing>
                <p className="mt-4 text-base font-semibold text-navy">{r.label} Index</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <Card className="h-full">
              <CardHeader title="Your standing" subtitle="Among all interns" icon={<Trophy className="h-5 w-5" />} />
              <div className="flex items-center gap-4 rounded-2xl bg-gradient-navy p-5 text-white grain">
                <p className="text-4xl font-bold">#{rank}</p>
                <div><p className="text-sm font-semibold">of {all.length} interns</p><p className="text-xs text-white/60">Keep it up, {user.name.split(" ")[0]}!</p></div>
              </div>
              <div className="mt-4 space-y-3">
                <ScoreBar label="Performance" value={user.performance ?? 0} />
                <ScoreBar label="Reliability" value={user.reliability ?? 0} />
                <ScoreBar label="Growth" value={user.growth ?? 0} />
                <ScoreBar label="Attendance" value={user.attendance ?? 0} />
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="h-full">
              <CardHeader title="Feedback" subtitle="From your team lead" icon={<Star className="h-5 w-5" />} />
              <div className="space-y-3">
                {myFeedback.map((f) => (
                  <div key={f.id} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
                    <div className="mb-1.5 flex items-center justify-between"><span className="text-sm font-semibold text-navy">{personById(f.fromId)?.name}</span><span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</span></div>
                    <p className="text-sm text-navy/70">{f.note}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{f.date}</p>
                  </div>
                ))}
                {myFeedback.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No feedback yet.</p>}
              </div>
            </Card>
          </Reveal>
        </div>
      </>
    );
  }

  // lead / hr / management
  const scope = role === "management" ? internsAll() : reportsOf(user.id);
  const indices = [
    { label: "Performance", value: avg(scope, "performance"), from: "#1D7FFF", to: "#6BC5FF" },
    { label: "Reliability", value: avg(scope, "reliability"), from: "#0A6BEF", to: "#6BC5FF" },
    { label: "Growth", value: avg(scope, "growth"), from: "#1D7FFF", to: "#93D5FF" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Performance"
        title={role === "management" ? "Performance Intelligence" : "Team Performance"}
        description={role === "management" ? "Company-wide performance, reliability, and growth indices with a live leaderboard." : "Track your team's composite indices and leaderboard standing."}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {indices.map((idx, i) => (
          <Reveal key={idx.label} delay={0.05 * i}>
            <Card className="flex h-full flex-col items-center text-center">
              <ProgressRing value={idx.value} size={128} stroke={12} from={idx.from} to={idx.to}><div><p className="text-2xl font-bold text-navy">{idx.value}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">avg</p></div></ProgressRing>
              <p className="mt-4 text-base font-semibold text-navy">{idx.label} Index</p>
            </Card>
          </Reveal>
        ))}
      </div>

      <PerformanceCompare
        people={scope}
        scopeLabel={role === "management" ? "All interns" : `${user.team ?? "Your"} team`}
      />
    </>
  );
}
