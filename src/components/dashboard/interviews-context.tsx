"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { interviews as seed, type Interview } from "@/lib/data";

interface InterviewsCtx {
  interviews: Interview[];
  addInterview: (i: Interview) => void;
}

const Ctx = createContext<InterviewsCtx | null>(null);

export function InterviewsProvider({ children }: { children: ReactNode }) {
  const [interviews, setInterviews] = useState<Interview[]>(seed);
  const addInterview = (i: Interview) => setInterviews((prev) => [i, ...prev]);
  return <Ctx.Provider value={{ interviews, addInterview }}>{children}</Ctx.Provider>;
}

export function useInterviews() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useInterviews must be used within InterviewsProvider");
  return ctx;
}
