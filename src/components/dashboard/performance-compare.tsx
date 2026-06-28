"use client";

import { useRef, useState } from "react";
import { Trophy, BarChart3, Check, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { initials, type Person } from "@/lib/org";
import { cn } from "@/lib/utils";

const SERIES = [
  { key: "performance", label: "Performance", color: "#1D7FFF" },
  { key: "reliability", label: "Reliability", color: "#6BC5FF" },
  { key: "growth", label: "Growth", color: "#0A6BEF" },
] as const;

const val = (p: Person, key: (typeof SERIES)[number]["key"]) => (p[key] as number | undefined) ?? 0;

export function PerformanceCompare({ people, scopeLabel }: { people: Person[]; scopeLabel: string }) {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const ranked = [...people].sort((a, b) => (b.performance ?? 0) - (a.performance ?? 0));
  const shown = selected.size > 0 ? ranked.filter((p) => selected.has(p.id)) : ranked;

  const pick = (id: string) => {
    setHighlightId(id);
    requestAnimationFrame(() =>
      colRefs.current[id]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    );
  };
  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setHighlightId(id);
  };

  if (ranked.length === 0) {
    return (
      <div className="mt-6">
        <Card>
          <CardHeader title="Index comparison" subtitle="Perf · Reliability · Growth" icon={<BarChart3 className="h-5 w-5" />} />
          <p className="py-12 text-center text-sm text-slate-400">No interns to compare yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-5">
      {/* Leaderboard */}
      <Card className="lg:col-span-2">
        <CardHeader title="Leaderboard" subtitle={scopeLabel} icon={<Trophy className="h-5 w-5" />} />
        <p className="mb-3 text-[11px] text-slate-400">Click to highlight · right-click to add to comparison</p>
        <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
          {ranked.map((p, i) => {
            const isHi = highlightId === p.id;
            const isSel = selected.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => pick(p.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggle(p.id);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                  isHi
                    ? "border-mjblue/40 bg-mjblue-50/60 ring-2 ring-mjblue/30"
                    : isSel
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-navy/5 bg-offwhite/60 hover:border-mjblue/20"
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold",
                    i === 0 ? "bg-amber-100 text-amber-700" : "bg-white text-navy/50 ring-1 ring-inset ring-navy/10"
                  )}
                >
                  {i + 1}
                </span>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">
                  {initials(p.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">{p.name}</p>
                  <p className="truncate text-xs text-slate-500">{p.title}</p>
                </div>
                {isSel ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <span className="text-lg font-bold text-navy tabular-nums">{p.performance ?? 0}</span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Comparison */}
      <Card className="lg:col-span-3">
        <CardHeader
          title="Index comparison"
          subtitle={selected.size > 0 ? `Comparing ${selected.size} selected` : `All ${ranked.length} — scroll to see more →`}
          icon={<BarChart3 className="h-5 w-5" />}
          action={
            selected.size > 0 ? (
              <button
                onClick={() => setSelected(new Set())}
                className="flex items-center gap-1 rounded-full border border-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-navy/60 transition-colors hover:text-navy"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            ) : null
          }
        />
        <div className="flex gap-2.5 overflow-x-auto pb-3">
          {shown.map((p) => {
            const isHi = highlightId === p.id;
            return (
              <div
                key={p.id}
                ref={(el) => {
                  colRefs.current[p.id] = el;
                }}
                onClick={() => pick(p.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggle(p.id);
                }}
                className={cn(
                  "shrink-0 cursor-pointer rounded-2xl border p-2.5 transition-all",
                  isHi ? "border-mjblue/40 bg-mjblue-50/50 ring-2 ring-mjblue/30" : "border-transparent hover:bg-offwhite/60"
                )}
                style={{ width: 80 }}
              >
                <div className="flex h-40 items-end justify-center gap-1.5">
                  {SERIES.map((s) => (
                    <div key={s.key} className="flex h-full w-3.5 items-end" title={`${s.label}: ${val(p, s.key)}`}>
                      <div
                        className="w-full rounded-t-md transition-[height] duration-500"
                        style={{ height: `${val(p, s.key)}%`, background: s.color }}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 truncate text-center text-xs font-semibold text-navy">{p.name.split(" ")[0]}</p>
                <div className="mt-1 flex justify-center gap-1 text-[9px] font-bold tabular-nums">
                  {SERIES.map((s) => (
                    <span key={s.key} style={{ color: s.color }}>
                      {val(p, s.key)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-navy/5 pt-3">
          {SERIES.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
