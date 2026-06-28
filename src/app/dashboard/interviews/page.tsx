import {
  CalendarCheck,
  CheckCircle2,
  Star,
  ClockAlert,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { InterviewAssessment } from "@/components/dashboard/interview-assessment";
import { InterviewsProvider } from "@/components/dashboard/interviews-context";
import { RoleGate } from "@/components/app/role-gate";
import { UpcomingInterviews, InterviewsTable } from "@/components/dashboard/interviews-board";
import { ScheduleInterviewButton } from "@/components/dashboard/interviews-actions";

const kpis = [
  { label: "Scheduled This Week", value: 18, delta: "+5", icon: <CalendarCheck className="h-5 w-5" />, spark: [9, 11, 12, 14, 16, 18] },
  { label: "Completed", value: 64, delta: "+12%", icon: <CheckCircle2 className="h-5 w-5" />, spark: [38, 44, 50, 55, 60, 64] },
  { label: "Avg Interview Score", value: 87, delta: "+2.6%", icon: <Star className="h-5 w-5" />, spark: [82, 83, 84, 85, 86, 87] },
  { label: "Pending Review", value: 7, delta: "-3", trend: "down" as const, icon: <ClockAlert className="h-5 w-5" />, spark: [12, 11, 10, 9, 8, 7] },
];

export default function InterviewsPage() {
  return (
    <RoleGate allow={["hr", "management"]}>
    <InterviewsProvider>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Module 03"
          title="AI Interview System"
          description="Automated scheduling with AI assessment of communication, confidence, and role-fit — turning every interview into a structured hiring signal."
          actions={<ScheduleInterviewButton />}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <Reveal key={k.label} delay={0.05 * i}>
              <StatCard {...k} />
            </Reveal>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
          <Reveal delay={0.05}>
            <Card className="h-full">
              <CardHeader
                title="Upcoming schedule"
                subtitle="Auto-scheduled with reminders"
                icon={<CalendarCheck className="h-5 w-5" />}
              />
              <UpcomingInterviews />
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <InterviewAssessment />
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <Card>
            <CardHeader
              title="All interviews"
              subtitle="Schedule, status, and AI scores"
              icon={<Video className="h-5 w-5" />}
            />
            <InterviewsTable />
          </Card>
        </Reveal>
      </div>
    </InterviewsProvider>
    </RoleGate>
  );
}
