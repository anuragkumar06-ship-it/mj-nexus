import { initials } from "@/lib/org";
import { cn } from "@/lib/utils";

/**
 * Avatar - shows the person's uploaded picture when available, otherwise their
 * initials on the brand gradient. Pass sizing via `className` (e.g. "h-9 w-9").
 */
export function Avatar({
  name,
  url,
  className,
  textClassName = "text-xs",
}: {
  name: string;
  url?: string | null;
  className?: string;
  textClassName?: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={name} className={cn("shrink-0 rounded-full object-cover", className)} />
    );
  }
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-gradient-brand font-bold text-white", textClassName, className)}>
      {initials(name)}
    </span>
  );
}
