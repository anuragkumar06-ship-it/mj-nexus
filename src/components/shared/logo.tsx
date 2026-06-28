import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  theme = "dark",
  size = 36,
}: {
  className?: string;
  showText?: boolean;
  theme?: "dark" | "light";
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid place-items-center rounded-xl bg-gradient-brand shadow-[0_6px_20px_-6px_rgba(29,127,255,0.7)]"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          style={{ width: size * 0.6, height: size * 0.6 }}
          className="text-white"
        >
          <path
            d="M5 18V6l7 7 7-7v12"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="1.6" fill="currentColor" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-sky shadow-[0_0_10px_2px_rgba(107,197,255,0.8)]" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "text-[15px] font-bold tracking-tight",
              theme === "dark" ? "text-white" : "text-navy"
            )}
          >
            MJ Nexus
          </span>
          <span
            className={cn(
              "text-[9px] font-medium uppercase tracking-[0.22em]",
              theme === "dark" ? "text-sky/70" : "text-mjblue/70"
            )}
          >
            Talent OS
          </span>
        </div>
      )}
    </div>
  );
}
