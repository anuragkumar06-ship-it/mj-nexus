"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { candidates as seed, type Candidate } from "@/lib/data";

interface RecruitmentCtx {
  candidates: Candidate[];
  addCandidate: (c: Candidate) => void;
}

const Ctx = createContext<RecruitmentCtx | null>(null);

export function RecruitmentProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>(seed);
  const addCandidate = (c: Candidate) => setCandidates((prev) => [c, ...prev]);
  return <Ctx.Provider value={{ candidates, addCandidate }}>{children}</Ctx.Provider>;
}

export function useRecruitment() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRecruitment must be used within RecruitmentProvider");
  return ctx;
}
