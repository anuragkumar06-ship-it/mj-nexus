"use client";

import { Award, CalendarDays, FileSignature, LayoutTemplate, ScrollText } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { CertificateStudio } from "@/components/dashboard/certificate-studio";
import { certificates, certificateStats, initials } from "@/lib/data";

const kpis = [
  { label: "Certificates Issued", value: certificateStats.issued, delta: "+19%", icon: <Award className="h-5 w-5" />, spark: [80, 96, 104, 120, 131, 142] },
  { label: "This Month", value: certificateStats.thisMonth, delta: "+24%", icon: <CalendarDays className="h-5 w-5" />, spark: [12, 16, 19, 22, 25, 28] },
  { label: "Recommendations", value: certificateStats.recommendations, delta: "+14%", icon: <FileSignature className="h-5 w-5" />, spark: [38, 44, 50, 55, 60, 64] },
  { label: "Templates", value: certificateStats.templates, icon: <LayoutTemplate className="h-5 w-5" />, spark: [3, 4, 4, 5, 6, 6] },
];

const statusTone: Record<string, "green" | "amber" | "slate"> = { Issued: "green", Generating: "amber", Draft: "slate" };
const typeTone: Record<string, "blue" | "sky" | "violet"> = { Completion: "blue", Appreciation: "sky", Recommendation: "violet" };

export function HrCertificates() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={0.05 * i}><StatCard {...k} /></Reveal>
        ))}
      </div>

      <Reveal delay={0.05}>
        <div className="mb-1 flex items-center gap-2 px-1">
          <Award className="h-5 w-5 text-mjblue" />
          <h2 className="text-lg font-semibold text-navy">Certificate Studio</h2>
        </div>
      </Reveal>

      <Reveal delay={0.08}><CertificateStudio /></Reveal>

      <Reveal delay={0.05}>
        <Card>
          <CardHeader title="Recent certificates" subtitle="Issued, generating & drafts" icon={<ScrollText className="h-5 w-5" />} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/5 text-xs uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Recipient</th><th className="pb-3 font-semibold">Type</th><th className="pb-3 font-semibold">Role</th><th className="pb-3 font-semibold">Issued</th><th className="pb-3 font-semibold">Score</th><th className="pb-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c.id} className="border-b border-navy/[0.04] last:border-0">
                    <td className="py-3"><div className="flex items-center gap-2.5"><div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">{initials(c.recipient)}</div><span className="font-medium text-navy">{c.recipient}</span></div></td>
                    <td className="py-3"><Badge tone={typeTone[c.type]}>{c.type}</Badge></td>
                    <td className="py-3 text-slate-500">{c.role}</td>
                    <td className="py-3 text-slate-500">{c.issued}</td>
                    <td className="py-3 font-bold text-navy">{c.score}</td>
                    <td className="py-3 text-right"><Badge tone={statusTone[c.status]}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
