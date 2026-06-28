"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { people as seedPeople, type Person, type Role } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/config";

interface PeopleCtx {
  people: Person[];
  loading: boolean;
  live: boolean;
  personById: (id?: string) => Person | undefined;
  reportsOf: (managerId?: string) => Person[];
  internsAll: () => Person[];
  leadsAll: () => Person[];
  hrAll: () => Person[];
  updatePerson: (id: string, patch: Partial<Person>) => Promise<void>;
  addPerson: (p: Person) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
}

const Ctx = createContext<PeopleCtx | null>(null);

export function PeopleProvider({ children }: { children: ReactNode }) {
  const live = isSupabaseConfigured();
  const [people, setPeople] = useState<Person[]>(live ? [] : seedPeople);
  const [loading, setLoading] = useState(live);

  const reload = useCallback(async () => {
    if (!live) return;
    try {
      const { loadProfiles } = await import("@/lib/supabase/profiles");
      const ps = await loadProfiles();
      setPeople(ps);
    } catch {
      setPeople((prev) => (prev.length ? prev : seedPeople));
    } finally {
      setLoading(false);
    }
  }, [live]);

  useEffect(() => {
    if (!live) return;
    let unsub = () => {};
    reload();
    (async () => {
      try {
        const { subscribeProfiles } = await import("@/lib/supabase/profiles");
        unsub = subscribeProfiles(() => reload());
      } catch {}
    })();
    return () => unsub();
  }, [live, reload]);

  const personById = useCallback((id?: string) => people.find((p) => p.id === id), [people]);
  const reportsOf = useCallback((managerId?: string) => people.filter((p) => p.managerId === managerId), [people]);
  const internsAll = useCallback(() => people.filter((p) => p.role === "intern"), [people]);
  const leadsAll = useCallback(() => people.filter((p) => p.role === "lead"), [people]);
  const hrAll = useCallback(() => people.filter((p) => p.role === "hr"), [people]);

  const updatePerson = useCallback(
    async (id: string, patch: Partial<Person>) => {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      if (!live) return;
      try {
        const { updateProfile } = await import("@/lib/supabase/profiles");
        const db: Record<string, unknown> = {};
        if (patch.role !== undefined) db.role = patch.role;
        if (patch.team !== undefined) db.team = patch.team;
        if (patch.managerId !== undefined) db.managerId = patch.managerId;
        if (patch.title !== undefined) db.title = patch.title;
        if (patch.name !== undefined) db.name = patch.name;
        if (patch.internStart !== undefined) db.internStart = patch.internStart;
        if (patch.internEnd !== undefined) db.internEnd = patch.internEnd;
        await updateProfile(id, db);
      } catch {}
    },
    [live]
  );

  const addPerson = useCallback(
    async (p: Person) => {
      setPeople((prev) => [p, ...prev.filter((x) => x.id !== p.id)]);
      if (!live) return;
      try {
        const { createProfile } = await import("@/lib/supabase/profiles");
        await createProfile(p);
      } catch {}
    },
    [live]
  );

  const removePerson = useCallback(
    async (id: string) => {
      setPeople((prev) => prev.filter((x) => x.id !== id));
      if (!live) return;
      try {
        const { removeProfile } = await import("@/lib/supabase/profiles");
        await removeProfile(id);
      } catch {}
    },
    [live]
  );

  return (
    <Ctx.Provider value={{ people, loading, live, personById, reportsOf, internsAll, leadsAll, hrAll, updatePerson, addPerson, removePerson }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePeople() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePeople must be used within PeopleProvider");
  return ctx;
}
