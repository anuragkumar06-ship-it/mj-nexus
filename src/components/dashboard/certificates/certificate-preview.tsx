"use client";

import { Logo } from "@/components/shared/logo";
import { BadgeCheck, Star } from "lucide-react";
import { downloadFile } from "@/lib/utils";
import { isLetter, type Certificate } from "@/lib/certificates";

function vId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return `MJN-2026-${(Math.abs(h) % 9000) + 1000}`;
}

function esc(s: string) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSVG(name: string, c: Certificate, vid: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#060c3f"/><stop offset="1" stop-color="#04082e"/></linearGradient>
    <linearGradient id="seal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
  </defs>
  <rect width="1000" height="700" fill="url(#bg)"/>
  <rect x="26" y="26" width="948" height="648" rx="22" fill="none" stroke="#6bc5ff" stroke-opacity="0.3" stroke-width="1.5"/>
  <text x="500" y="130" text-anchor="middle" fill="#bfe6ff" font-family="Inter,Arial,sans-serif" font-size="18" letter-spacing="7">MJ NEXUS · ${esc(c.title.toUpperCase())}</text>
  <text x="500" y="210" text-anchor="middle" fill="#ffffff" fill-opacity="0.7" font-family="Inter,Arial,sans-serif" font-size="18">This is proudly presented to</text>
  <text x="500" y="310" text-anchor="middle" fill="#ffffff" font-family="Georgia,'Times New Roman',serif" font-size="64" font-weight="bold">${esc(name)}</text>
  <line x1="360" y1="350" x2="640" y2="350" stroke="#6bc5ff" stroke-opacity="0.5"/>
  <text x="500" y="398" text-anchor="middle" fill="#cdd7ff" font-family="Inter,Arial,sans-serif" font-size="19">${esc(c.type)}</text>
  <circle cx="500" cy="510" r="40" fill="url(#seal)"/>
  <text x="500" y="522" text-anchor="middle" fill="#050b3d" font-family="Inter,Arial,sans-serif" font-size="34">★</text>
  <text x="220" y="600" text-anchor="middle" fill="#bfe6ff" font-family="Georgia,serif" font-size="22" font-style="italic">${esc(c.issuedByName || "M. Joshi")}</text>
  <line x1="140" y1="615" x2="300" y2="615" stroke="#ffffff" stroke-opacity="0.25"/>
  <text x="220" y="638" text-anchor="middle" fill="#ffffff" fill-opacity="0.5" font-family="Inter,Arial,sans-serif" font-size="12" letter-spacing="2">ISSUED BY</text>
  <text x="780" y="600" text-anchor="middle" fill="#ffffff" fill-opacity="0.7" font-family="Inter,Arial,sans-serif" font-size="16">${esc(c.createdAt || "2026")}</text>
  <line x1="700" y1="615" x2="860" y2="615" stroke="#ffffff" stroke-opacity="0.25"/>
  <text x="780" y="638" text-anchor="middle" fill="#ffffff" fill-opacity="0.5" font-family="Inter,Arial,sans-serif" font-size="12" letter-spacing="2">ISSUED</text>
  <text x="500" y="672" text-anchor="middle" fill="#6bc5ff" fill-opacity="0.7" font-family="Inter,Arial,sans-serif" font-size="12">Verified by MJ Nexus · ID ${vid}</text>
</svg>`;
}

export function downloadCert(c: Certificate, name: string) {
  const safe = name.replace(/\s+/g, "-");
  const typeSafe = c.type.replace(/\s+/g, "-");
  if (isLetter(c.type)) {
    downloadFile(`${safe}-${typeSafe}.txt`, `${c.title}\n\n${c.message}\n\n— ${c.issuedByName || "MJ Marketing Consultancy"}\nMJ Marketing Consultancy · Verified ID ${vId(c.id)}`);
    return;
  }
  downloadFile(`${safe}-${typeSafe}.svg`, buildSVG(name, c, vId(c.id)), "image/svg+xml");
}

export function CertificatePreview({ c, name }: { c: Certificate; name: string }) {
  const letter = isLetter(c.type);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-navy p-6 text-white shadow-[0_30px_80px_-30px_rgba(5,11,61,0.7)] sm:p-9">
      <div className="absolute inset-0 grid-dark opacity-40" />
      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-mjblue/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-3 rounded-2xl border border-sky/20" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <Logo theme="dark" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky/70">MJ Marketing Consultancy</span>
        </div>

        {letter ? (
          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">{c.title}</p>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/80">{c.message}</p>
            <p className="mt-6 font-serif text-lg italic text-sky-200">{c.issuedByName || "M. Joshi"}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/50">MJ Marketing Consultancy</p>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">{c.title}</p>
            <p className="mt-5 text-sm text-white/55">This is proudly presented to</p>
            <h2 className="mt-2 font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">{name}</h2>
            <div className="mx-auto mt-3 h-px w-40 bg-linear-to-r from-transparent via-sky/50 to-transparent" />
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/65">{c.message}</p>
          </div>
        )}

        <div className="mt-9 flex items-end justify-between">
          <div className="text-center">
            <p className="font-serif text-lg italic text-sky-200">{c.issuedByName || "M. Joshi"}</p>
            <div className="mt-1 h-px w-28 bg-white/20" />
            <p className="mt-1.5 text-[10px] uppercase tracking-wider text-white/50">Issued by</p>
          </div>
          <div className="relative grid h-20 w-20 place-items-center">
            <div className="absolute inset-0 animate-spin-slow rounded-full ring-orbit opacity-70" />
            <div className="grid h-16 w-16 place-items-center rounded-full bg-linear-to-br from-amber-300 to-amber-500 text-navy shadow-[0_8px_24px_-6px_rgba(245,158,11,0.6)]">
              <Star className="h-7 w-7" fill="currentColor" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-white/70">{c.createdAt || "2026"}</p>
            <div className="mt-1 h-px w-28 bg-white/20" />
            <p className="mt-1.5 text-[10px] uppercase tracking-wider text-white/50">Issued</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-white/40">
          <BadgeCheck className="h-3.5 w-3.5 text-sky" /> Verified by MJ Nexus · ID {vId(c.id)}
        </div>
      </div>
    </div>
  );
}
