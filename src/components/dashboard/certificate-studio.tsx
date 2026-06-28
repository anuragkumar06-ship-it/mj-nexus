"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Download,
  Sparkles,
  BadgeCheck,
  Star,
  FileSignature,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { interns, initials, type Intern } from "@/lib/data";
import { useToast } from "@/components/ui/toast";
import { cn, downloadFile } from "@/lib/utils";
import { burstConfetti } from "@/lib/confetti";

const types = ["Completion", "Appreciation"] as const;
type CertType = (typeof types)[number];

function buildCertificateSVG(it: Intern, type: CertType, verifyId: string) {
  const subtitle =
    type === "Completion"
      ? `Completion · ${it.role} Internship · ${it.team} Team`
      : `Appreciation · ${it.role} Internship · ${it.team} Team`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#060c3f"/><stop offset="1" stop-color="#04082e"/></linearGradient>
    <linearGradient id="seal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
  </defs>
  <rect width="1000" height="700" fill="url(#bg)"/>
  <rect x="26" y="26" width="948" height="648" rx="22" fill="none" stroke="#6bc5ff" stroke-opacity="0.3" stroke-width="1.5"/>
  <text x="500" y="130" text-anchor="middle" fill="#bfe6ff" font-family="Inter,Arial,sans-serif" font-size="18" letter-spacing="7">MJ NEXUS · CERTIFICATE OF ${type.toUpperCase()}</text>
  <text x="500" y="210" text-anchor="middle" fill="#ffffff" fill-opacity="0.7" font-family="Inter,Arial,sans-serif" font-size="18">This certificate is proudly presented to</text>
  <text x="500" y="310" text-anchor="middle" fill="#ffffff" font-family="Georgia,'Times New Roman',serif" font-size="66" font-weight="bold">${it.name}</text>
  <line x1="370" y1="350" x2="630" y2="350" stroke="#6bc5ff" stroke-opacity="0.5"/>
  <text x="500" y="400" text-anchor="middle" fill="#cdd7ff" font-family="Inter,Arial,sans-serif" font-size="20">${subtitle}</text>
  <text x="500" y="440" text-anchor="middle" fill="#ffffff" fill-opacity="0.6" font-family="Inter,Arial,sans-serif" font-size="16">${it.performance}% performance · ${it.reliability}% reliability · ${it.growth}% growth</text>
  <circle cx="500" cy="540" r="40" fill="url(#seal)"/>
  <text x="500" y="552" text-anchor="middle" fill="#050b3d" font-family="Inter,Arial,sans-serif" font-size="34">★</text>
  <text x="220" y="600" text-anchor="middle" fill="#bfe6ff" font-family="Georgia,serif" font-size="22" font-style="italic">M. Joshi</text>
  <line x1="140" y1="615" x2="300" y2="615" stroke="#ffffff" stroke-opacity="0.25"/>
  <text x="220" y="638" text-anchor="middle" fill="#ffffff" fill-opacity="0.5" font-family="Inter,Arial,sans-serif" font-size="12" letter-spacing="2">FOUNDER</text>
  <text x="780" y="600" text-anchor="middle" fill="#ffffff" fill-opacity="0.7" font-family="Inter,Arial,sans-serif" font-size="16">June 2026</text>
  <line x1="700" y1="615" x2="860" y2="615" stroke="#ffffff" stroke-opacity="0.25"/>
  <text x="780" y="638" text-anchor="middle" fill="#ffffff" fill-opacity="0.5" font-family="Inter,Arial,sans-serif" font-size="12" letter-spacing="2">ISSUED</text>
  <text x="500" y="672" text-anchor="middle" fill="#6bc5ff" fill-opacity="0.7" font-family="Inter,Arial,sans-serif" font-size="12">Verified by MJ Nexus · ID ${verifyId}</text>
</svg>`;
}

function recommendation(it: Intern, type: CertType) {
  const first = it.name.split(" ")[0];
  if (type === "Appreciation") {
    return `It is my pleasure to recognize ${it.name} for outstanding contributions to the ${it.team} team at MJ Marketing Consultancy. ${first} consistently exceeded expectations, maintaining a ${it.performance}% performance score and a ${it.reliability}% reliability index. ${first} brought energy, ownership, and a growth mindset to every project, and is a genuine asset to any team.`;
  }
  return `To whom it may concern,\n\nI am delighted to recommend ${it.name}, who completed a ${it.role} internship with the ${it.team} team at MJ Marketing Consultancy. Over the program, ${first} achieved a ${it.performance}% performance score, a ${it.reliability}% reliability index, and a ${it.growth}% growth index — reflecting strong execution, dependability, and rapid development.\n\n${first} is proactive, collaborative, and consistently delivers high-quality work. I recommend ${first} without reservation for any future role.`;
}

export function CertificateStudio() {
  const { toast } = useToast();
  const [id, setId] = useState(interns[0].id);
  const [type, setType] = useState<CertType>("Completion");
  const it = interns.find((i) => i.id === id)!;
  const verifyId = `MJN-2026-${(parseInt(it.id.replace(/\D/g, "")) * 1471) % 9000 + 1000}`;

  const [aiLetter, setAiLetter] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  useEffect(() => setAiLetter(null), [id, type]);
  const letter = aiLetter ?? recommendation(it, type);

  const aiRewrite = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: it.name, role: it.role, team: it.team, performance: it.performance, reliability: it.reliability, growth: it.growth, type }),
      });
      const data = await res.json();
      setAiLetter(data.letter);
      toast({ title: data.source === "live" ? "Rewritten with AI" : "AI draft ready", description: `Recommendation for ${it.name}.`, type: "success" });
    } catch {
      toast({ title: "Couldn't reach AI", description: "Showing the standard draft.", type: "error" });
    } finally {
      setAiLoading(false);
    }
  };

  const downloadCertificate = () => {
    downloadFile(
      `${it.name.replace(/\s+/g, "-")}-${type}-Certificate.svg`,
      buildCertificateSVG(it, type, verifyId),
      "image/svg+xml"
    );
    toast({ title: "Certificate downloaded", description: `${type} certificate for ${it.name} saved as SVG.`, type: "success" });
  };

  const downloadLetter = () => {
    downloadFile(`${it.name.replace(/\s+/g, "-")}-Recommendation.txt`, letter);
    toast({ title: "Letter downloaded", description: `Recommendation letter for ${it.name} saved.`, type: "success" });
  };

  const issue = () => {
    burstConfetti();
    toast({ title: "Certificate issued", description: `Emailed to ${it.name.split(" ")[0].toLowerCase()}@example.com and logged.`, type: "success" });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* recipients + type */}
      <div className="rounded-3xl border border-navy/5 bg-white p-4 shadow-card">
        <p className="mb-2 px-1 text-sm font-semibold text-navy">Certificate type</p>
        <div className="mb-4 flex rounded-full bg-navy/5 p-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="relative flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              {type === t && (
                <motion.span
                  layoutId="cert-type"
                  className="absolute inset-0 rounded-full bg-white shadow-card"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={cn("relative", type === t ? "text-navy" : "text-navy/50")}>{t}</span>
            </button>
          ))}
        </div>

        <p className="mb-2 px-1 text-sm font-semibold text-navy">Recipient</p>
        <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
          {interns.map((p) => (
            <button
              key={p.id}
              onClick={() => setId(p.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-all",
                p.id === id
                  ? "border-mjblue/30 bg-mjblue-50/60"
                  : "border-transparent hover:bg-navy/[0.03]"
              )}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">
                {initials(p.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy">{p.name}</p>
                <p className="truncate text-[11px] text-slate-500">{p.role} · {p.team}</p>
              </div>
              <span className="text-xs font-bold text-navy/60">{p.performance}</span>
            </button>
          ))}
        </div>
      </div>

      {/* preview */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${id}-${type}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {/* Certificate */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-navy p-6 text-white shadow-[0_30px_80px_-30px_rgba(5,11,61,0.7)] sm:p-9">
              <div className="absolute inset-0 grid-dark opacity-40" />
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-mjblue/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-3 rounded-2xl border border-sky/20" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <Logo theme="dark" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky/70">
                    MJ Marketing Consultancy
                  </span>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
                    Certificate of {type}
                  </p>
                  <p className="mt-5 text-sm text-white/55">This certificate is proudly presented to</p>
                  <h2 className="mt-2 font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    {it.name}
                  </h2>
                  <div className="mx-auto mt-3 h-px w-40 bg-linear-to-r from-transparent via-sky/50 to-transparent" />
                  <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/65">
                    {type === "Completion"
                      ? `for successfully completing the ${it.role} Internship with the ${it.team} team, demonstrating excellence with a ${it.performance}% performance score.`
                      : `in recognition of outstanding contribution and dedication to the ${it.team} team during the ${it.role} internship program.`}
                  </p>
                </div>

                <div className="mt-9 flex items-end justify-between">
                  <div className="text-center">
                    <p className="font-serif text-lg italic text-sky-200">M. Joshi</p>
                    <div className="mt-1 h-px w-28 bg-white/20" />
                    <p className="mt-1.5 text-[10px] uppercase tracking-wider text-white/50">
                      Founder
                    </p>
                  </div>

                  {/* seal */}
                  <div className="relative grid h-20 w-20 place-items-center">
                    <div className="absolute inset-0 animate-spin-slow rounded-full ring-orbit opacity-70" />
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-linear-to-br from-amber-300 to-amber-500 text-navy shadow-[0_8px_24px_-6px_rgba(245,158,11,0.6)]">
                      <Star className="h-7 w-7" fill="currentColor" />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] text-white/70">Jun 2026</p>
                    <div className="mt-1 h-px w-28 bg-white/20" />
                    <p className="mt-1.5 text-[10px] uppercase tracking-wider text-white/50">
                      Issued
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-white/40">
                  <BadgeCheck className="h-3.5 w-3.5 text-sky" />
                  Verified by MJ Nexus · ID {verifyId}
                </div>
              </div>
            </div>

            {/* Recommendation letter */}
            <div className="mt-4 rounded-3xl border border-navy/5 bg-white p-6 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-mjblue-50 text-mjblue">
                    <FileSignature className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">AI Recommendation Letter</p>
                    <p className="text-xs text-slate-500">Generated from performance data</p>
                  </div>
                </div>
                <button
                  onClick={aiRewrite}
                  disabled={aiLoading}
                  className="flex items-center gap-1 rounded-full bg-mjblue-50 px-2.5 py-1 text-[11px] font-bold text-mjblue-700 transition-colors hover:bg-mjblue-100 disabled:opacity-60"
                >
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI rewrite
                </button>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-navy/75">
                {letter}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadCertificate}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(29,127,255,0.6)] transition-transform hover:scale-[1.02]"
          >
            <Download className="h-4 w-4" /> Download certificate
          </button>
          <button
            onClick={downloadLetter}
            className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/[0.03]"
          >
            <FileSignature className="h-4 w-4" /> Download letter
          </button>
          <button
            onClick={issue}
            className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/[0.03]"
          >
            <Award className="h-4 w-4" /> Issue & email
          </button>
        </div>
      </div>
    </div>
  );
}
