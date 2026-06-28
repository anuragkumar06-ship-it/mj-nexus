"use client";

import { Award, Download, BadgeCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/app/auth";
import { downloadFile } from "@/lib/utils";
import { burstConfetti } from "@/lib/confetti";
import { certificates } from "@/lib/data";

function certSVG(name: string, type: string, role: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#060c3f"/><stop offset="1" stop-color="#04082e"/></linearGradient></defs><rect width="1000" height="700" fill="url(#bg)"/><rect x="26" y="26" width="948" height="648" rx="22" fill="none" stroke="#6bc5ff" stroke-opacity="0.3"/><text x="500" y="140" text-anchor="middle" fill="#bfe6ff" font-family="Inter,Arial" font-size="18" letter-spacing="6">NEXUS TALENT OS · CERTIFICATE OF ${type.toUpperCase()}</text><text x="500" y="220" text-anchor="middle" fill="#ffffff" fill-opacity="0.7" font-family="Inter,Arial" font-size="18">This certificate is proudly presented to</text><text x="500" y="320" text-anchor="middle" fill="#ffffff" font-family="Georgia,serif" font-size="64" font-weight="bold">${name}</text><text x="500" y="400" text-anchor="middle" fill="#cdd7ff" font-family="Inter,Arial" font-size="20">${role} Internship · Nexus Talent OS</text><text x="500" y="600" text-anchor="middle" fill="#6bc5ff" fill-opacity="0.7" font-family="Inter,Arial" font-size="13">Verified by Nexus Talent OS · June 2026</text></svg>`;
}

export function MyCertificates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const mine = certificates.filter((c) => c.recipient === user.name);

  const download = (type: string, role: string) => {
    downloadFile(`${user.name.replace(/\s+/g, "-")}-${type}.svg`, certSVG(user.name, type, role), "image/svg+xml");
    burstConfetti();
    toast({ title: "Certificate downloaded", description: `Your ${type} certificate is saved.`, type: "success" });
  };

  if (mine.length === 0) {
    return (
      <Card className="grid place-items-center py-16 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-mjblue-50 text-mjblue"><Award className="h-7 w-7" /></div>
        <h3 className="text-lg font-bold text-navy">No certificates yet</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">Keep completing tasks and growing - your completion and appreciation certificates will appear here once issued by HR.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {mine.map((c, i) => (
        <Reveal key={c.id} delay={(i % 3) * 0.08}>
          <SpotlightCard className="gradient-ring h-full rounded-3xl border border-navy/5 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-white"><Award className="h-6 w-6" /></span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600"><BadgeCheck className="h-3.5 w-3.5" /> {c.status}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-navy">Certificate of {c.type}</h3>
            <p className="mt-1 text-sm text-slate-500">{c.role} Internship · score {c.score}</p>
            <button onClick={() => download(c.type, c.role)} className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
              <Download className="h-4 w-4" /> Download
            </button>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}
