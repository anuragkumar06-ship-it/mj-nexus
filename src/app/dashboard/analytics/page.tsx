"use client";

import { Users, UserCheck, Percent, Gauge, Filter, MapPin, GraduationCap, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { ScoreBar } from "@/components/shared/charts";
import { BarGroup } from "@/components/dashboard/charts";
import { RoleGate } from "@/components/app/role-gate";
import { AnalyticsActions } from "@/components/dashboard/analytics-actions";
import { useRecruitment } from "@/components/dashboard/recruitment-context";
import { ROLE_COLORS } from "@/lib/data";

const SHORTLISTED = ["Under Review", "Interview Scheduled", "Selected", "Onboarded"];
const SELECTEDPLUS = ["Selected", "Onboarded"];

export default function AnalyticsPage() {
  const { candidates } = useRecruitment();
  const total = candidates.length;
  const inStage = (s: string[]) => candidates.filter((c) => s.includes(c.stage)).length;
  const onboarded = inStage(["Onboarded"]);
  const rate = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);
  const avgFit = total ? Math.round(candidates.reduce((s, c) => s + (c.fitScore ?? 0), 0) / total) : 0;

  const groupBy = (pick: (c: (typeof candidates)[number]) => string) => {
    const m = new Map<string, number>();
    candidates.forEach((c) => { const k = pick(c) || "—"; m.set(k, (m.get(k) ?? 0) + 1); });
    return [...m.entries()].map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v);
  };

  const roleBars = (["Marketing", "Sales", "HR"] as const).map((role) => ({ role, value: candidates.filter((c) => c.role === role).length, color: ROLE_COLORS[role] }));
  const sources = groupBy((c) => c.source).map((x) => ({ source: x.k, applicants: x.v }));
  const geo = groupBy((c) => c.state).map((x) => ({ state: x.k, applicants: x.v })).slice(0, 8);
  const colleges = groupBy((c) => c.college).slice(0, 6).map((x) => {
    const inC = candidates.filter((c) => c.college === x.k);
    const sel = inC.filter((c) => SELECTEDPLUS.includes(c.stage)).length;
    return { college: x.k, applicants: x.v, selectionRate: rate(sel, x.v) };
  });
  const maxCollege = Math.max(1, ...colleges.map((c) => c.applicants));
  const funnel = [
    { stage: "Applied", value: total },
    { stage: "Under Review", value: inStage(SHORTLISTED) },
    { stage: "Interview", value: inStage(["Interview Scheduled", "Selected", "Onboarded"]) },
    { stage: "Selected", value: inStage(SELECTEDPLUS) },
    { stage: "Onboarded", value: onboarded },
  ];
  const conv = [
    { label: "Application → Review", value: rate(funnel[1].value, total) },
    { label: "Review → Interview", value: rate(funnel[2].value, funnel[1].value) },
    { label: "Interview → Selected", value: rate(funnel[3].value, funnel[2].value) },
    { label: "Selected → Onboarded", value: rate(onboarded, funnel[3].value) },
  ];

  const kpis = [
    { label: "Total Applicants", value: total, icon: <Users className="h-5 w-5" /> },
    { label: "Hires (Onboarded)", value: onboarded, icon: <UserCheck className="h-5 w-5" /> },
    { label: "Conversion Rate", value: rate(onboarded, total), suffix: "%", decimals: 1, icon: <Percent className="h-5 w-5" /> },
    { label: "Avg Fit Score", value: avgFit, icon: <Gauge className="h-5 w-5" /> },
  ];

  return (
    <RoleGate allow={["hr", "management"]}>
      <div className="space-y-6">
        <PageHeader eyebrow="Module 07" title="Analytics & Intelligence" description="Hiring funnel, sources, geography and colleges — computed live from your candidate data." actions={<AnalyticsActions />} />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <Reveal key={k.label} delay={0.05 * i}><StatCard {...k} /></Reveal>
          ))}
        </div>

        {total === 0 ? (
          <Card className="grid place-items-center py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mjblue-50 text-mjblue"><BarChart3 className="h-6 w-6" /></div>
            <h3 className="text-lg font-bold text-navy">No data to analyze yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Add candidates in the Recruitment module and your hiring analytics will populate here automatically.</p>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              <Reveal className="lg:col-span-2" delay={0.05}>
                <Card className="h-full">
                  <CardHeader title="Applications by role" icon={<BarChart3 className="h-5 w-5" />} />
                  <BarGroup data={roleBars} xKey="role" series={[{ key: "value", color: "#1D7FFF", name: "Applicants" }]} height={260} />
                </Card>
              </Reveal>
              <Reveal delay={0.1}>
                <Card className="h-full">
                  <CardHeader title="Hiring funnel" subtitle="Applied → Onboarded" icon={<Filter className="h-5 w-5" />} />
                  <div className="space-y-3">
                    {funnel.map((f, i) => (
                      <div key={f.stage}>
                        <div className="mb-1 flex items-center justify-between text-sm"><span className="text-slate-600">{f.stage}</span><span className="font-semibold text-navy tabular-nums">{f.value}</span></div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-navy/[0.06]"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${total ? (f.value / total) * 100 : 0}%`, opacity: 1 - i * 0.12 }} /></div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Reveal>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Reveal delay={0.05}>
                <Card className="h-full">
                  <CardHeader title="Source effectiveness" subtitle="Applicants by channel" />
                  <BarGroup data={sources} xKey="source" series={[{ key: "applicants", color: "#1D7FFF", name: "Applicants" }]} height={250} horizontal />
                </Card>
              </Reveal>
              <Reveal delay={0.1}>
                <Card className="h-full">
                  <CardHeader title="Conversion rates" subtitle="Stage-to-stage efficiency" />
                  <div className="space-y-4 pt-1">{conv.map((c, i) => <ScoreBar key={c.label} label={c.label} value={c.value} suffix="%" delay={i * 0.1} />)}</div>
                </Card>
              </Reveal>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Reveal delay={0.05}>
                <Card className="h-full">
                  <CardHeader title="Geographic distribution" subtitle="Applicants by state" icon={<MapPin className="h-5 w-5" />} />
                  <BarGroup data={geo} xKey="state" series={[{ key: "applicants", color: "#6BC5FF", name: "Applicants" }]} height={280} horizontal />
                </Card>
              </Reveal>
              <Reveal delay={0.1}>
                <Card className="h-full">
                  <CardHeader title="College analytics" subtitle="Volume & selection rate" icon={<GraduationCap className="h-5 w-5" />} />
                  <div className="space-y-3">
                    {colleges.map((c) => (
                      <div key={c.college} className="flex items-center gap-4 rounded-2xl border border-navy/5 bg-offwhite/50 p-3">
                        <div className="w-40 shrink-0"><p className="truncate text-sm font-semibold text-navy">{c.college}</p><p className="text-xs text-slate-500">{c.applicants} applicants</p></div>
                        <div className="hidden flex-1 sm:block"><div className="h-2 overflow-hidden rounded-full bg-navy/[0.06]"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(c.applicants / maxCollege) * 100}%` }} /></div></div>
                        <div className="shrink-0 text-right"><p className="text-sm font-bold text-navy">{c.selectionRate}%</p><p className="text-[10px] uppercase tracking-wide text-slate-400">Selection</p></div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Reveal>
            </div>
          </>
        )}
      </div>
    </RoleGate>
  );
}
