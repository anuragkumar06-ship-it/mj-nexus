"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { interviews as seed, type Interview } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/config";

interface InterviewsCtx {
  interviews: Interview[];
  addInterview: (i: Interview) => void;
  live: boolean;
}

const Ctx = createContext<InterviewsCtx | null>(null);

export function InterviewsProvider({ children }: { children: ReactNode }) {
  const live = isSupabaseConfigured();
  const [interviews, setInterviews] = useState<Interview[]>(live ? [] : seed);

  useEffect(() => {
    if (!live) return;
    let unsub = () => {};
    (async () => {
      try {
        const { loadInterviews, subscribeInterviews } = await import("@/lib/supabase/recruitment-data");
        setInterviews(await loadInterviews());
        unsub = subscribeInterviews((type, obj) =>
          setInterviews((prev) => {
            if (type === "DELETE") return prev.filter((i) => i.id !== (obj as { id: string }).id);
            const o = obj as Interview;
            const idx = prev.findIndex((i) => i.id === o.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = o;
              return copy;
            }
            return [o, ...prev];
          })
        );
      } catch {
        // DB unavailable
      }
    })();
    return () => unsub();
  }, [live]);

  const addInterview = (i: Interview) => {
    setInterviews((prev) => [i, ...prev]);
    if (live) import("@/lib/supabase/recruitment-data").then((m) => m.insertInterview(i)).catch(() => {});
  };

  return <Ctx.Provider value={{ interviews, addInterview, live }}>{children}</Ctx.Provider>;
}

export function useInterviews() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useInterviews must be used within InterviewsProvider");
  return ctx;
}
