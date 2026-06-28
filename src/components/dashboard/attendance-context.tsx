"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/app/auth";
import { isSupabaseConfigured } from "@/lib/config";
import type { AttendanceRecord } from "@/lib/supabase/attendance-data";

export type PolicyRole = "intern" | "lead" | "hr";
export interface RolePolicy {
  pct: number; // minimum attendance %
  hours: number; // hours in the dashboard required before check-in
}
export type AttendancePolicy = Record<PolicyRole, RolePolicy>;

const DEFAULT_POLICY: AttendancePolicy = {
  intern: { pct: 75, hours: 0 },
  lead: { pct: 75, hours: 0 },
  hr: { pct: 75, hours: 0 },
};

function parsePolicy(raw: string | null): AttendancePolicy {
  if (!raw) return DEFAULT_POLICY;
  try {
    const p = JSON.parse(raw);
    const role = (r: any, d: RolePolicy): RolePolicy => ({ pct: Number(r?.pct ?? d.pct) || 0, hours: Number(r?.hours ?? d.hours) || 0 });
    return { intern: role(p?.intern, DEFAULT_POLICY.intern), lead: role(p?.lead, DEFAULT_POLICY.lead), hr: role(p?.hr, DEFAULT_POLICY.hr) };
  } catch {
    return DEFAULT_POLICY;
  }
}

interface AttendanceCtx {
  records: AttendanceRecord[];
  markToday: () => void;
  policy: AttendancePolicy;
  setPolicy: (p: AttendancePolicy) => void;
  live: boolean;
}

const Ctx = createContext<AttendanceCtx | null>(null);
const todayStr = () => new Date().toISOString().slice(0, 10);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const live = isSupabaseConfigured();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [policy, setPolicyState] = useState<AttendancePolicy>(DEFAULT_POLICY);

  useEffect(() => {
    if (!live) return;
    let unsub = () => {};
    let unsubSettings = () => {};
    (async () => {
      try {
        const m = await import("@/lib/supabase/attendance-data");
        setRecords(await m.loadAttendance());
        setPolicyState(parsePolicy(await m.loadSetting("attendance_policy")));
        unsub = m.subscribeAttendance((type, obj) =>
          setRecords((prev) => {
            if (type === "DELETE") return prev.filter((r) => r.id !== (obj as { id: string }).id);
            const o = obj as AttendanceRecord;
            const i = prev.findIndex((r) => r.id === o.id);
            if (i >= 0) {
              const c = [...prev];
              c[i] = o;
              return c;
            }
            return [o, ...prev];
          })
        );
        unsubSettings = m.subscribeSettings((k, v) => {
          if (k === "attendance_policy") setPolicyState(parsePolicy(v));
        });
      } catch {
        // table missing / offline
      }
    })();
    return () => {
      unsub();
      unsubSettings();
    };
  }, [live]);

  const setPolicy = (p: AttendancePolicy) => {
    setPolicyState(p);
    if (live) import("@/lib/supabase/attendance-data").then((m) => m.saveSetting("attendance_policy", JSON.stringify(p))).catch(() => {});
  };

  const markToday = () => {
    if (!user?.id) return;
    const date = todayStr();
    const checkIn = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const rec: AttendanceRecord = { id: `${user.id}_${date}`, userId: user.id, date, status: "Present", checkIn };
    setRecords((prev) => (prev.some((r) => r.id === rec.id) ? prev : [rec, ...prev]));
    if (live) import("@/lib/supabase/attendance-data").then((m) => m.markPresent(user.id, date, checkIn)).catch(() => {});
  };

  return <Ctx.Provider value={{ records, markToday, policy, setPolicy, live }}>{children}</Ctx.Provider>;
}

export function useAttendance() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAttendance must be used within AttendanceProvider");
  return c;
}
