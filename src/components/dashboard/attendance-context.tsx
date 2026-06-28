"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/app/auth";
import { isSupabaseConfigured } from "@/lib/config";
import type { AttendanceRecord } from "@/lib/supabase/attendance-data";

interface AttendanceCtx {
  records: AttendanceRecord[];
  markToday: () => void;
  minPct: number;
  setMinPct: (n: number) => void;
  live: boolean;
}

const Ctx = createContext<AttendanceCtx | null>(null);
const todayStr = () => new Date().toISOString().slice(0, 10);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const live = isSupabaseConfigured();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [minPct, setMinPctState] = useState(75);

  useEffect(() => {
    if (!live) return;
    let unsub = () => {};
    let unsubSettings = () => {};
    (async () => {
      try {
        const m = await import("@/lib/supabase/attendance-data");
        setRecords(await m.loadAttendance());
        const mp = await m.loadSetting("attendance_min_pct");
        if (mp) setMinPctState(Number(mp) || 75);
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
          if (k === "attendance_min_pct") setMinPctState(Number(v) || 75);
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

  const setMinPct = (n: number) => {
    setMinPctState(n);
    if (live) import("@/lib/supabase/attendance-data").then((m) => m.saveSetting("attendance_min_pct", String(n))).catch(() => {});
  };

  const markToday = () => {
    if (!user?.id) return;
    const date = todayStr();
    const checkIn = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const rec: AttendanceRecord = { id: `${user.id}_${date}`, userId: user.id, date, status: "Present", checkIn };
    setRecords((prev) => (prev.some((r) => r.id === rec.id) ? prev : [rec, ...prev]));
    if (live) import("@/lib/supabase/attendance-data").then((m) => m.markPresent(user.id, date, checkIn)).catch(() => {});
  };

  return <Ctx.Provider value={{ records, markToday, minPct, setMinPct, live }}>{children}</Ctx.Provider>;
}

export function useAttendance() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAttendance must be used within AttendanceProvider");
  return c;
}
