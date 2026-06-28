import {
  Users,
  Filter,
  Video,
  CheckCircle2,
  KanbanSquare,
  BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { ScoreBar } from "@/components/shared/charts";
import { BarGroup } from "@/components/dashboard/charts";
import { RecruitmentBoard } from "@/components/dashboard/recruitment-board";
import { RecruitmentProvider } from "@/components/dashboard/recruitment-context";
import { RoleGate } from "@/components/app/role-gate";
import {
  AddCandidateButton,
  ExportCandidatesButton,
} from "@/components/dashboard/recruitment-actions";
import {
  recruitmentKpis,
  applicationsByRole,
  conversionRates,
  ROLE_COLORS,
} from "@/lib/data";

const kpis = [
  { label: "Total Applicants", value: recruitmentKpis.totalApplicants, delta: "+13.7%", icon: <Users className="h-5 w-5" />, spark: [142, 168, 154, 196, 184, 221] },
  { label: "Shortlisting Rate", value: recruitmentKpis.shortlistingRate, suffix: "%", delta: "+4.1%", icon: <Filter className="h-5 w-5" />, spark: [30, 32, 34, 35, 37, 38] },
  { label: "Interview Rate", value: recruitmentKpis.interviewRate, suffix: "%", delta: "+2.3%", icon: <Video className="h-5 w-5" />, spark: [16, 18, 19, 20, 21, 22] },
  { label: "Hiring Rate", value: recruitmentKpis.hiringRate, suffix: "%", decimals: 1, delta: "+1.2%", icon: <CheckCircle2 className="h-5 w-5" />, spark: [6, 7, 7.5, 8, 9, 9.4] },
];

export default function RecruitmentPage() {
  const roleBars = applicationsByRole.map((r) => ({
    role: r.role,
    value: r.value,
    color: ROLE_COLORS[r.role as keyof typeof ROLE_COLORS],
  }));

  return (
    <RoleGate allow={["hr", "management"]}>
    <RecruitmentProvider>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Module 01"
          title="Recruitment Management"
          description="Track every candidate from application to onboarding with a live pipeline and real-time recruitment metrics."
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
            <CardHeader
              title="Candidate Pipeline"
              subtitle="Live tracking across every stage"
              icon={<KanbanSquare className="h-5 w-5" />}
              action={<Badge tone="blue">Live</Badge>}
            />
            <RecruitmentBoard />
          </Card>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <Card className="h-full">
              <CardHeader
                title="Applications by role"
                subtitle="Where demand is concentrated"
                icon={<BarChart3 className="h-5 w-5" />}
              />
              <BarGroup
                data={roleBars}
                xKey="role"
                series={[{ key: "value", color: "#1D7FFF", name: "Applicants" }]}
                height={250}
              />
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="h-full">
              <CardHeader
                title="Conversion rates"
                subtitle="Stage-to-stage efficiency"
                icon={<Filter className="h-5 w-5" />}
              />
              <div className="space-y-4 pt-1">
                {conversionRates.map((c, i) => (
                  <ScoreBar key={c.label} label={c.label} value={c.value} suffix="%" delay={i * 0.1} />
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </RecruitmentProvider>
    </RoleGate>
  );
}
