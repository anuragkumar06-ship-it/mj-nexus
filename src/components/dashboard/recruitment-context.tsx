"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { candidates as seed, type Candidate } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/config";

interface RecruitmentCtx {
  candidates: Candidate[];
  addCandidate: (c: Candidate) => Promise<void>;
  removeCandidate: (id: string) => void;
  setCandidateStage: (id: string, stage: Candidate["stage"]) => void;
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

  const addCandidate = async (c: Candidate) => {
    setCandidates((prev) => [c, ...prev]);
    if (!live) return;
    try {
      const m = await import("@/lib/supabase/recruitment-data");
      await m.insertCandidate(c);
    } catch (e) {
      // DB rejected it (e.g. recruitment migration not run) — roll back + let caller surface it.
      setCandidates((prev) => prev.filter((x) => x.id !== c.id));
      throw e;
    }
  };

  const removeCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    if (live) import("@/lib/supabase/recruitment-data").then((m) => m.deleteCandidate(id)).catch(() => {});
  };

  const setCandidateStage = (id: string, stage: Candidate["stage"]) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
    if (live) import("@/lib/supabase/recruitment-data").then((m) => m.updateCandidateStage(id, stage)).catch(() => {});
  };

  return <Ctx.Provider value={{ candidates, addCandidate, removeCandidate, setCandidateStage, live }}>{children}</Ctx.Provider>;
}

export function useRecruitment() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRecruitment must be used within RecruitmentProvider");
  return ctx;
}
