"use client";

import { Users, Filter, Video, CheckCircle2, KanbanSquare, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { ScoreBar } from "@/components/shared/charts";
import { BarGroup } from "@/components/dashboard/charts";
import { RecruitmentBoard } from "@/components/dashboard/recruitment-board";
import { RoleGate } from "@/components/app/role-gate";
import { AddCandidateButton, ExportCandidatesButton } from "@/components/dashboard/recruitment-actions";
import { useRecruitment } from "@/components/dashboard/recruitment-context";
import { ROLE_COLORS } from "@/lib/data";

const SHORTLISTED = ["Under Review", "Interview Scheduled", "Selected", "Onboarded"];
const INTERVIEWED = ["Interview Scheduled", "Selected", "Onboarded"];

export default function RecruitmentPage() {
  const { candidates } = useRecruitment();
  const total = candidates.length;
  const inStage = (s: string[]) => candidates.filter((c) => s.includes(c.stage)).length;
  const shortlisted = inStage(SHORTLISTED);
  const interviewed = inStage(INTERVIEWED);
  const selectedPlus = inStage(["Selected", "Onboarded"]);
  const onboarded = inStage(["Onboarded"]);
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);

  const kpis = [
    { label: "Total Applicants", value: total, icon: <Users className="h-5 w-5" /> },
    { label: "Shortlisting Rate", value: pct(shortlisted, total), suffix: "%", decimals: 1, icon: <Filter className="h-5 w-5" /> },
    { label: "Interview Rate", value: pct(interviewed, total), suffix: "%", decimals: 1, icon: <Video className="h-5 w-5" /> },
    { label: "Hiring Rate", value: pct(onboarded, total), suffix: "%", decimals: 1, icon: <CheckCircle2 className="h-5 w-5" /> },
  ];
  const roleBars = (["Marketing", "Sales", "HR"] as const).map((role) => ({
    role,
    value: candidates.filter((c) => c.role === role).length,
    color: ROLE_COLORS[role],
  }));
  const conv = [
    { label: "Application → Review", value: pct(shortlisted, total) },
    { label: "Review → Interview", value: pct(interviewed, shortlisted) },
    { label: "Interview → Selected", value: pct(selectedPlus, interviewed) },
    { label: "Selected → Onboarded", value: pct(onboarded, selectedPlus) },
  ];

  return (
    <RoleGate allow={["lead", "hr", "management"]}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Module 01"
          title="Recruitment Management"
          description="Track every candidate from application to onboarding — all live and saved to your database."
          actions={
            <>
              <ExportCandidatesButton />
              <AddCandidateButton />
            </>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <Reveal key={k.label} delay={0.05 * i}>
              <StatCard {...k} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.05}>
          <Card>
            <CardHeader title="Candidate Pipeline" subtitle="Live tracking across every stage" icon={<KanbanSquare className="h-5 w-5" />} action={<Badge tone="blue">{total} total</Badge>} />
            <RecruitmentBoard />
          </Card>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <Card className="h-full">
              <CardHeader title="Applications by role" subtitle="Where demand is concentrated" icon={<BarChart3 className="h-5 w-5" />} />
              {total === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No candidates yet — add your first applicant to see the breakdown.</p>
              ) : (
                <BarGroup data={roleBars} xKey="role" series={[{ key: "value", color: "#1D7FFF", name: "Applicants" }]} height={250} />
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="h-full">
              <CardHeader title="Conversion rates" subtitle="Stage-to-stage efficiency" icon={<Filter className="h-5 w-5" />} />
              <div className="space-y-4 pt-1">
                {conv.map((c, i) => (
                  <ScoreBar key={c.label} label={c.label} value={c.value} suffix="%" delay={i * 0.1} />
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </RoleGate>
  );
}
