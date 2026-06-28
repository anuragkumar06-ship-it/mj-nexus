import { cn } from "@/lib/utils";

/** Decorative animated gradient orbs + grid. Pure CSS, no JS. */
export function AuroraBackground({
  className,
  variant = "navy",
}: {
  className?: string;
  variant?: "navy" | "light";
}) {
  if (variant === "light") {
    return (
      <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
        <div className="absolute inset-0 grid-faint opacity-60" />
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-mjblue/10 blur-3xl animate-aurora" />
        <div className="absolute right-0 top-40 h-[24rem] w-[24rem] rounded-full bg-sky/20 blur-3xl animate-float-slow" />
      </div>
    );
  }
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-navy" />
      <div className="absolute inset-0 grid-dark opacity-70" />
      <div className="absolute -left-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-mjblue/25 blur-[120px] animate-aurora" />
      <div className="absolute right-[-10%] top-10 h-[30rem] w-[30rem] rounded-full bg-sky/20 blur-[120px] animate-float-slow" />
      <div className="absolute bottom-[-10%] left-1/3 h-[28rem] w-[28rem] rounded-full bg-mjblue/15 blur-[120px] animate-float" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(4,8,46,0.4))]" />
    </div>
  );
}
