import Link from "next/link";
import {
  Users,
  ScanSearch,
  Video,
  LayoutDashboard,
  Gauge,
  Award,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { cn } from "@/lib/utils";

const modules = [
  {
    n: "01",
    icon: Users,
    title: "Recruitment Management",
    desc: "Candidate portal, application tracking, and a live recruitment dashboard from Applied to Onboarded.",
    points: ["Candidate Portal", "Tracking System", "Recruitment Dashboard"],
    href: "/dashboard/recruitment",
  },
  {
    n: "02",
    icon: ScanSearch,
    title: "AI Recruitment Engine",
    desc: "Resume intelligence that extracts skills, summarizes candidates, and computes a precise fit score.",
    points: ["Resume Intelligence", "Candidate Scoring", "Fit Recommendation"],
    href: "/dashboard/ai-engine",
    featured: true,
  },
  {
    n: "03",
    icon: Video,
    title: "AI Interview System",
    desc: "Automated scheduling with AI assessment of communication, confidence, and role-fit.",
    points: ["Smart Scheduling", "Transcript Analysis", "Hiring Recommendation"],
    href: "/dashboard/interviews",
  },
  {
    n: "04",
    icon: LayoutDashboard,
    title: "Internship Workspace",
    desc: "An intern home for tasks, progress, daily standups, announcements, and learning resources.",
    points: ["Task Management", "Daily Standups", "Learning Hub"],
    href: "/dashboard/workspace",
  },
  {
    n: "05",
    icon: Gauge,
    title: "Performance Intelligence",
    desc: "Performance, reliability, and growth indices with monthly, quarterly, and all-time leaderboards.",
    points: ["Performance Score", "Reliability Index", "Leaderboard"],
    href: "/dashboard/performance",
  },
  {
    n: "06",
    icon: Award,
    title: "Certificate Automation",
    desc: "Auto-generate completion and appreciation certificates plus personalized recommendation letters.",
    points: ["Auto Certificates", "Recommendations", "LinkedIn-ready"],
    href: "/dashboard/certificates",
  },
  {
    n: "07",
    icon: BarChart3,
    title: "Analytics & Intelligence",
    desc: "Hiring funnels, college and geographic insights, and department comparisons in real time.",
    points: ["Hiring Analytics", "College & Geo", "Department Insights"],
    href: "/dashboard/analytics",
  },
];

export function Modules() {
  return (
    <section id="modules" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-mjblue-50 px-4 py-1.5 text-xs font-semibold text-mjblue-700 ring-1 ring-inset ring-mjblue/15">
            The Platform
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            One platform.{" "}
            <span className="text-gradient-animated">Seven intelligent modules.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500">
            Everything Nexus Talent OS needs to recruit, develop, and
            certify talent - replacing scattered tools with a single source of truth.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <Reveal key={m.n} delay={(i % 3) * 0.08}>
                <Link href={m.href} className="group block h-full">
                  <SpotlightCard
                    glow={m.featured ? "rgba(107,197,255,0.22)" : "rgba(29,127,255,0.16)"}
                    className={cn(
                      "gradient-ring flex h-full flex-col rounded-3xl border p-6 transition-shadow duration-300",
                      m.featured
                        ? "shine border-transparent bg-gradient-navy text-white shadow-[0_24px_70px_-30px_rgba(5,11,61,0.7)]"
                        : "border-navy/5 bg-white shadow-card hover:shadow-soft"
                    )}
                  >
                    {m.featured && (
                      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mjblue/30 blur-3xl" />
                    )}
                    <div className="relative flex items-center justify-between">
                      <div
                        className={cn(
                          "grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                          m.featured ? "bg-white/10 text-sky" : "bg-mjblue-50 text-mjblue"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          m.featured ? "text-white/30" : "text-navy/15"
                        )}
                      >
                        {m.n}
                      </span>
                    </div>

                    <h3
                      className={cn(
                        "relative mt-5 text-lg font-semibold tracking-tight",
                        m.featured ? "text-white" : "text-navy"
                      )}
                    >
                      {m.title}
                    </h3>
                    <p
                      className={cn(
                        "relative mt-2 flex-1 text-sm leading-relaxed",
                        m.featured ? "text-white/65" : "text-slate-500"
                      )}
                    >
                      {m.desc}
                    </p>

                    <div className="relative mt-5 flex flex-wrap gap-1.5">
                      {m.points.map((p) => (
                        <span
                          key={p}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-medium",
                            m.featured ? "bg-white/10 text-sky-200" : "bg-navy/5 text-navy/60"
                          )}
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    <div
                      className={cn(
                        "relative mt-5 flex items-center gap-1.5 text-sm font-semibold",
                        m.featured ? "text-sky" : "text-mjblue"
                      )}
                    >
                      Explore module
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </SpotlightCard>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
