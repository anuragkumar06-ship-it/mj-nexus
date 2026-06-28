"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { candidates as seed, type Candidate } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/config";

interface RecruitmentCtx {
  candidates: Candidate[];
  addCandidate: (c: Candidate) => void;
  removeCandidate: (id: string) => void;
  live: boolean;
}

const Ctx = createContext<RecruitmentCtx | null>(null);

export function RecruitmentProvider({ children }: { children: ReactNode }) {
  const live = isSupabaseConfigured();
  const [candidates, setCandidates] = useState<Candidate[]>(live ? [] : seed);

  useEffect(() => {
    if (!live) return;
    let unsub = () => {};
    (async () => {
      try {
        const { loadCandidates, subscribeCandidates } = await import("@/lib/supabase/recruitment-data");
        setCandidates(await loadCandidates());
        unsub = subscribeCandidates((type, obj) =>
          setCandidates((prev) => {
            if (type === "DELETE") return prev.filter((c) => c.id !== (obj as { id: string }).id);
            const o = obj as Candidate;
            const i = prev.findIndex((c) => c.id === o.id);
            if (i >= 0) {
              const copy = [...prev];
              copy[i] = o;
              return copy;
            }
            return [o, ...prev];
          })
        );
      } catch {
        // DB unavailable — keep clean/empty (or seed in demo)
      }
    })();
    return () => unsub();
  }, [live]);

  const addCandidate = (c: Candidate) => {
    setCandidates((prev) => [c, ...prev]);
    if (live) import("@/lib/supabase/recruitment-data").then((m) => m.insertCandidate(c)).catch(() => {});
  };

  const removeCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    if (live) import("@/lib/supabase/recruitment-data").then((m) => m.deleteCandidate(id)).catch(() => {});
  };

  return <Ctx.Provider value={{ candidates, addCandidate, removeCandidate, live }}>{children}</Ctx.Provider>;
}

export function useRecruitment() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRecruitment must be used within RecruitmentProvider");
  return ctx;
}
