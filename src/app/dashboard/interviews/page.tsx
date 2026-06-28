"use client";

import { CalendarCheck, CheckCircle2, Star, ClockAlert, Video } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { RoleGate } from "@/components/app/role-gate";
import { InterviewAssessment } from "@/components/dashboard/interview-assessment";
import { UpcomingInterviews, InterviewsTable } from "@/components/dashboard/interviews-board";
import { ScheduleInterviewButton } from "@/components/dashboard/interviews-actions";
import { useInterviews } from "@/components/dashboard/interviews-context";

export default function InterviewsPage() {
  const { interviews } = useInterviews();
  const upcoming = interviews.filter((i) => i.status === "Upcoming").length;
  const completed = interviews.filter((i) => i.status === "Completed").length;
  const pending = interviews.filter((i) => i.status === "Pending Review").length;
  const scored = interviews.filter((i) => typeof i.score === "number");
  const avg = scored.length ? Math.round(scored.reduce((s, i) => s + (i.score ?? 0), 0) / scored.length) : 0;

  const kpis = [
    { label: "Upcoming", value: upcoming, icon: <CalendarCheck className="h-5 w-5" /> },
    { label: "Completed", value: completed, icon: <CheckCircle2 className="h-5 w-5" /> },
    { label: "Avg Interview Score", value: avg, icon: <Star className="h-5 w-5" /> },
    { label: "Pending Review", value: pending, icon: <ClockAlert className="h-5 w-5" /> },
  ];

  return (
    <RoleGate allow={["hr", "management"]}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Module 03"
          title="AI Interview System"
          description="Schedule interviews and assess communication, confidence, and role-fit — all live and saved."
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
              <CardHeader title="Upcoming schedule" subtitle="Auto-scheduled with reminders" icon={<CalendarCheck className="h-5 w-5" />} />
              <UpcomingInterviews />
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <InterviewAssessment />
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <Card>
            <CardHeader title="All interviews" subtitle="Schedule, status, and AI scores" icon={<Video className="h-5 w-5" />} />
            <InterviewsTable />
          </Card>
        </Reveal>
      </div>
    </RoleGate>
  );
}
