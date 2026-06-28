"use client";

import { BookOpen, GraduationCap, PlayCircle, Trophy } from "lucide-react";
import { RoleGate } from "@/components/app/role-gate";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { useToast } from "@/components/ui/toast";
import { learningResources } from "@/lib/data";

export default function LearningPage() {
  const { toast } = useToast();
  const completed = learningResources.filter((l) => l.progress >= 90).length;

  return (
    <RoleGate allow={["intern", "lead"]}>
      <PageHeader
        eyebrow="Learning"
        title="Learning Hub"
        description="Level up with curated paths in marketing, recruiting, branding, and sales — tracked toward your growth index."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Active paths", value: learningResources.length, icon: BookOpen },
          { label: "Completed", value: completed, icon: Trophy },
          { label: "Lessons total", value: learningResources.reduce((s, l) => s + l.lessons, 0), icon: GraduationCap },
          { label: "Avg progress", value: `${Math.round(learningResources.reduce((s, l) => s + l.progress, 0) / learningResources.length)}%`, icon: PlayCircle },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.label} delay={0.05 * i}>
              <Card>
                <Icon className="h-5 w-5 text-mjblue" />
                <p className="mt-3 text-2xl font-bold text-navy">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {learningResources.map((l, i) => (
          <Reveal key={l.id} delay={(i % 3) * 0.08}>
            <SpotlightCard className="gradient-ring h-full rounded-3xl border border-navy/5 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-white"><BookOpen className="h-6 w-6" /></span>
                <Badge tone="navy">{l.level}</Badge>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-navy">{l.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{l.lessons} lessons</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs"><span className="text-slate-500">Progress</span><span className="font-semibold text-navy">{l.progress}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-navy/[0.06]"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${l.progress}%` }} /></div>
              </div>
              <button
                onClick={() => toast({ title: l.progress >= 90 ? "Path completed 🎉" : "Resuming path", description: l.title, type: "success" })}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy/5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
              >
                <PlayCircle className="h-4 w-4" /> {l.progress >= 90 ? "Review" : l.progress > 0 ? "Continue" : "Start"}
              </button>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </RoleGate>
  );
}
