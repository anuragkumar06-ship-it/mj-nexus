import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Sparkline } from "@/components/shared/charts";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  suffix = "",
  decimals = 0,
  delta,
  trend = "up",
  spark,
  icon,
  color = "#1D7FFF",
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  delta?: string;
  trend?: "up" | "down";
  spark?: number[];
  icon: React.ReactNode;
  color?: string;
}) {
  const up = trend === "up";
  return (
    <SpotlightCard
      tilt={false}
      className="hover-lift group h-full rounded-3xl border border-navy/5 bg-white p-5 shadow-card"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-mjblue/5 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mjblue-50 text-mjblue transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-bold",
              up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}
          >
            {up ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {delta}
          </span>
        )}
      </div>
      <p className="relative mt-4 text-3xl font-bold tracking-tight text-navy">
        <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
      </p>
      <p className="relative mt-1 text-sm text-slate-500">{label}</p>
      {spark && (
        <div className="relative mt-3 h-9">
          <Sparkline data={spark} color={color} height={36} />
        </div>
      )}
    </SpotlightCard>
  );
}
