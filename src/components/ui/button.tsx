import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "glass" | "outline" | "ghost" | "white";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-brand text-white shadow-[0_8px_30px_-8px_rgba(29,127,255,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(29,127,255,0.75)] hover:brightness-[1.05]",
  secondary:
    "bg-navy text-white hover:bg-navy-700 shadow-[0_8px_30px_-12px_rgba(5,11,61,0.6)]",
  glass:
    "glass-dark text-white hover:bg-white/10",
  outline:
    "border border-navy/15 text-navy hover:border-mjblue/40 hover:bg-mjblue-50/60",
  ghost: "text-navy/70 hover:text-navy hover:bg-navy/5",
  white: "bg-white text-navy hover:bg-white/90 shadow-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-14 px-7 text-base gap-2.5",
  icon: "h-11 w-11",
};

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mjblue/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
