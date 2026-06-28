import { cn } from "@/lib/utils";

export function Card({
  className,
  glass,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glass?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-navy/5 bg-white p-6 shadow-card",
        glass && "glass border-white/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-mjblue-50 text-mjblue">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold tracking-tight text-navy">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

type Tone = "blue" | "sky" | "navy" | "green" | "red" | "amber" | "slate" | "violet";

const toneMap: Record<Tone, string> = {
  blue: "bg-mjblue-50 text-mjblue-700 ring-mjblue/20",
  sky: "bg-sky-100 text-mjblue-700 ring-sky/30",
  navy: "bg-navy/5 text-navy ring-navy/10",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
  red: "bg-rose-50 text-rose-600 ring-rose-500/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-500/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-400/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-500/20",
};

export function Badge({
  tone = "blue",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
