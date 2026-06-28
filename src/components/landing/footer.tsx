import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const cols = [
  {
    title: "Platform",
    links: [
      { label: "Recruitment", href: "/dashboard/recruitment" },
      { label: "AI Engine", href: "/dashboard/ai-engine" },
      { label: "Interviews", href: "/dashboard/interviews" },
      { label: "Workspace", href: "/dashboard/workspace" },
    ],
  },
  {
    title: "Intelligence",
    links: [
      { label: "Performance", href: "/dashboard/performance" },
      { label: "Certificates", href: "/dashboard/certificates" },
      { label: "Analytics", href: "/dashboard/analytics" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Vision", href: "#platform" },
      { label: "Modules", href: "#modules" },
      { label: "Lifecycle", href: "#lifecycle" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy px-6 pb-10 pt-16 text-white">
      <div className="absolute inset-0 grid-dark opacity-40" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 pb-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo theme="dark" />
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              The AI-powered operating system for internship-driven
              organizations — by MJ Marketing Consultancy.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold text-white">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/55 transition-colors hover:text-sky"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} MJ Marketing Consultancy · MJ Nexus v1.0
          </p>
          <p className="text-xs text-white/45">
            Designed with a premium glassmorphism aesthetic · Built on Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
