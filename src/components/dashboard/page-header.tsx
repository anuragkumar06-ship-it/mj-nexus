import { Reveal } from "@/components/shared/reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="relative mb-7">
        <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-72 rounded-full bg-mjblue/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mjblue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-mjblue-700 ring-1 ring-inset ring-mjblue/15">
                <span className="h-1.5 w-1.5 rounded-full bg-mjblue" />
                {eyebrow}
              </span>
            )}
            <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </div>
    </Reveal>
  );
}
