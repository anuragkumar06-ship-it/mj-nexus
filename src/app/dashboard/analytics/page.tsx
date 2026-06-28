import {
  Users,
  UserCheck,
  Percent,
  Gauge,
  LineChart as LineIcon,
  Filter,
  Radar as RadarIcon,
  MapPin,
  GraduationCap,
  Building2,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { AnalyticsActions } from "@/components/dashboard/analytics-actions";
import { RoleGate } from "@/components/app/role-gate";
import { Reveal } from "@/components/shared/reveal";
import { ScoreBar } from "@/components/shared/charts";
import { LineTrend, BarGroup, RadarCompare } from "@/components/dashboard/charts";
import {
  monthlyHiring,
  recruitmentFunnel,
  conversionRates,
  sourceEffectiveness,
  geoAnalytics,
  collegeAnalytics,
  departmentAnalytics,
  departmentRadar,
  ROLE_COLORS,
  type Role,
} from "@/lib/data";

const kpis = [
  { label: "Total Applicants", value: 1284, delta: "+13.7%", icon: <Users className="h-5 w-5" />, spark: [142, 168, 201, 234, 268, 271] },
  { label: "Total Hires", value: 94, delta: "+9.1%", icon: <UserCheck className="h-5 w-5" />, spark: [11, 13, 16, 19, 22, 24] },
  { label: "Conversion Rate", value: 7.3, suffix: "%", decimals: 1, delta: "+0.8%", icon: <Percent className="h-5 w-5" />, spark: [6.1, 6.4, 6.7, 6.9, 7.1, 7.3] },
  { label: "Perf After Hire", value: 88, suffix: "%", delta: "+2.4%", icon: <Gauge className="h-5 w-5" />, spark: [82, 83, 85, 86, 87, 88] },
];

const maxCollege = Math.max(...collegeAnalytics.map((c) => c.applicants));

export default function AnalyticsPage() {
  const sources = sourceEffectiveness.map((s) => ({ source: s.source, applicants: s.applicants }));
  const geo = geoAnalytics.map((g) => ({ state: g.state, applicants: g.applicants }));

  return (
    <RoleGate allow={["hr", "management"]}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 07"
        title="Analytics & Intelligence"
        description="Hiring funnels, source effectiveness, college and geographic insights, and department comparisons — the full workforce intelligence picture."
        actions={<AnalyticsActions />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={0.05 * i}>
            <StatCard {...k} />
          </Reveal>
        ))}
      </div>

      {/* Trend + funnel */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2" delay={0.05}>
          <Card className="h-full">
            <CardHeader
              title="Monthly hiring trend"
              subtitle="Applicants vs hires"
              icon={<LineIcon className="h-5 w-5" />}
              action={<Badge tone="green">+9.1% YoY</Badge>}
            />
            <LineTrend
              data={monthlyHiring}
              xKey="month"
              series={[
                { key: "applicants", color: "#1D7FFF", name: "Applicants" },
                { key: "hires", color: "#6BC5FF", name: "Hires" },
              ]}
              height={280}
            />
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader title="Hiring funnel" subtitle="Applied → Onboarded" icon={<Filter className="h-5 w-5" />} />
            <div className="space-y-3">
              {recruitmentFunnel.map((f, i) => {
                const pct = Math.round((f.value / recruitmentFunnel[0].value) * 100);
                return (
                  <div key={f.stage}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-600">{f.stage}</span>
                      <span className="font-semibold text-navy tabular-nums">{f.value}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-navy/[0.06]">
                      <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${pct}%`, opacity: 1 - i * 0.12 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Source + conversion */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.05}>
          <Card className="h-full">
            <CardHeader title="Source effectiveness" subtitle="Applicants by channel" />
            <BarGroup
              data={sources}
              xKey="source"
              series={[{ key: "applicants", color: "#1D7FFF", name: "Applicants" }]}
              height={250}
              horizontal
            />
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader title="Conversion rates" subtitle="Stage-to-stage efficiency" />
            <div className="space-y-4 pt-1">
              {conversionRates.map((c, i) => (
                <ScoreBar key={c.label} label={c.label} value={c.value} suffix="%" delay={i * 0.1} />
              ))}
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Geographic + department radar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.05}>
          <Card className="h-full">
            <CardHeader title="Geographic distribution" subtitle="Applicants by state" icon={<MapPin className="h-5 w-5" />} />
            <BarGroup
              data={geo}
              xKey="state"
              series={[{ key: "applicants", color: "#6BC5FF", name: "Applicants" }]}
              height={280}
              horizontal
            />
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader title="Department comparison" subtitle="HR · Marketing · Sales" icon={<RadarIcon className="h-5 w-5" />} />
            <RadarCompare
              data={departmentRadar}
              series={[
                { key: "Marketing", color: "#1D7FFF" },
                { key: "Sales", color: "#0A6BEF" },
                { key: "HR", color: "#6BC5FF" },
              ]}
              height={300}
            />
          </Card>
        </Reveal>
      </div>

      {/* College analytics */}
      <Reveal delay={0.05}>
        <Card>
          <CardHeader title="College analytics" subtitle="Volume, selection rate & performance after hiring" icon={<GraduationCap className="h-5 w-5" />} />
          <div className="space-y-3">
            {collegeAnalytics.map((c) => (
              <div key={c.college} className="flex items-center gap-4 rounded-2xl border border-navy/5 bg-offwhite/50 p-3.5">
                <div className="w-40 shrink-0">
                  <p className="truncate text-sm font-semibold text-navy">{c.college}</p>
                  <p className="text-xs text-slate-500">{c.applicants} applicants</p>
                </div>
                <div className="hidden flex-1 sm:block">
                  <div className="h-2 overflow-hidden rounded-full bg-navy/[0.06]">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(c.applicants / maxCollege) * 100}%` }} />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-5 text-right">
                  <div>
                    <p className="text-sm font-bold text-navy">{c.selectionRate}%</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Selection</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">{c.perfAfterHire}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Perf</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      {/* Department analytics cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {departmentAnalytics.map((d, i) => (
          <Reveal key={d.dept} delay={0.05 * i}>
            <Card className="h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl text-white"
                    style={{ background: ROLE_COLORS[d.dept as Role] }}
                  >
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-navy">{d.dept}</p>
                    <p className="text-xs text-slate-500">{d.headcount} interns</p>
                  </div>
                </div>
                <Badge tone="blue">{d.openRoles} open</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-offwhite/60 p-3">
                  <p className="text-2xl font-bold text-navy">{d.avgPerf}</p>
                  <p className="text-xs text-slate-500">Avg performance</p>
                </div>
                <div className="rounded-2xl bg-offwhite/60 p-3">
                  <p className="text-2xl font-bold text-navy">{d.retention}%</p>
                  <p className="text-xs text-slate-500">Retention</p>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
    </RoleGate>
  );
}
