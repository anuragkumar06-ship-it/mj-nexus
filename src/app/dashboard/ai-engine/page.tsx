import {
  FileText,
  Sparkles,
  Zap,
  Clock,
  ScanSearch,
  Brain,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { AiEnginePanel } from "@/components/dashboard/ai-engine-panel";
import { RoleGate } from "@/components/app/role-gate";

const kpis = [
  { label: "Resumes Parsed", value: 1284, delta: "+19%", icon: <FileText className="h-5 w-5" />, spark: [80, 96, 104, 120, 131, 142] },
  { label: "Avg Fit Score", value: 84, delta: "+3.1%", icon: <Sparkles className="h-5 w-5" />, spark: [78, 79, 81, 82, 83, 84] },
  { label: "Auto-Shortlisted", value: 487, delta: "+12%", icon: <Zap className="h-5 w-5" />, spark: [310, 360, 390, 420, 460, 487] },
  { label: "Screening Time Saved", value: 70, suffix: "%", delta: "+8%", icon: <Clock className="h-5 w-5" />, spark: [48, 54, 60, 64, 67, 70] },
];

const criteria = [
  { label: "Relevant Skills", desc: "Match to role requirements" },
  { label: "Experience", desc: "Depth & relevance of work" },
  { label: "Communication", desc: "Clarity & written signal" },
  { label: "Education", desc: "Academic background" },
  { label: "Portfolio Quality", desc: "Proof of real work" },
];

export default function AiEnginePage() {
  return (
    <RoleGate allow={["hr", "management"]}>
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 02"
        title="AI Recruitment Engine"
        description="Resume intelligence that extracts skills, summarizes candidates, scores role fit, and recommends the next step — automatically."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={0.05 * i}>
            <StatCard {...k} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.05}>
        <div className="mb-1 flex items-center gap-2 px-1">
          <Brain className="h-5 w-5 text-mjblue" />
          <h2 className="text-lg font-semibold text-navy">Resume Intelligence & Scoring</h2>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <AiEnginePanel />
      </Reveal>

      {/* Evaluation criteria explainer */}
      <Reveal delay={0.05}>
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-mjblue" />
            <h3 className="text-base font-semibold text-navy">How the AI evaluates every candidate</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {criteria.map((c, i) => (
              <div
                key={c.label}
                className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4"
              >
                <div className="mb-2 grid h-8 w-8 place-items-center rounded-xl bg-gradient-brand text-xs font-bold text-white">
                  {i + 1}
                </div>
                <p className="text-sm font-semibold text-navy">{c.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>
    </div>
    </RoleGate>
  );
}
