"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/app/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { LEARNING_SEED, type LearningResource } from "@/lib/learning";

export type LearningItem = LearningResource & { progress: number };

interface LearningCtx {
  items: LearningItem[];
  categories: string[];
  addResource: (r: LearningResource) => void;
  removeResource: (id: string) => void;
  setProgress: (resourceId: string, progress: number) => void;
  live: boolean;
}

const Ctx = createContext<LearningCtx | null>(null);

// Demo-only sample progress so the UI isn't empty without a database.
const DEMO_PROGRESS: Record<string, number> = { lr1: 50, lr3: 100, lr4: 50 };

export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const live = isSupabaseConfigured();
  const [resources, setResources] = useState<LearningResource[]>(live ? [] : LEARNING_SEED);
  const [progress, setProgressMap] = useState<Record<string, number>>(live ? {} : DEMO_PROGRESS);

  useEffect(() => {
    if (!live) return;
    let unsubR = () => {};
    let unsubP = () => {};
    (async () => {
      try {
        const m = await import("@/lib/supabase/learning-data");
        setResources(await m.loadResources());
        unsubR = m.subscribeResources((type, obj) =>
          setResources((prev) => {
            if (type === "DELETE") return prev.filter((r) => r.id !== (obj as { id: string }).id);
            const o = obj as LearningResource;
            const i = prev.findIndex((r) => r.id === o.id);
            if (i >= 0) {
              const c = [...prev];
              c[i] = o;
              return c;
            }
            return [o, ...prev];
          })
        );
        if (user?.id) {
          setProgressMap(await m.loadProgress(user.id));
          unsubP = m.subscribeProgress(user.id, (rid, p) => setProgressMap((prev) => ({ ...prev, [rid]: p })));
        }
      } catch {
        // DB unavailable — stay clean
      }
    })();
    return () => {
      unsubR();
      unsubP();
    };
  }, [live, user?.id]);

  const addResource = (r: LearningResource) => {
    setResources((prev) => [r, ...prev]);
    if (live) import("@/lib/supabase/learning-data").then((m) => m.insertResource(r)).catch(() => {});
  };
  const removeResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    if (live) import("@/lib/supabase/learning-data").then((m) => m.deleteResource(id)).catch(() => {});
  };
  const setProgress = (resourceId: string, p: number) => {
    setProgressMap((prev) => ({ ...prev, [resourceId]: p }));
    if (live && user?.id) import("@/lib/supabase/learning-data").then((m) => m.upsertProgress(user.id, resourceId, p)).catch(() => {});
  };

  const items: LearningItem[] = resources.map((r) => ({ ...r, progress: progress[r.id] ?? 0 }));
  const categories = Array.from(new Set(resources.map((r) => r.category))).sort();

  return <Ctx.Provider value={{ items, categories, addResource, removeResource, setProgress, live }}>{children}</Ctx.Provider>;
}

export function useLearning() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLearning must be used within LearningProvider");
  return c;
}
