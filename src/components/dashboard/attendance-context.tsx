"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/app/auth";
import { isSupabaseConfigured } from "@/lib/config";
import type { AttendanceRecord } from "@/lib/supabase/attendance-data";

interface AttendanceCtx {
  records: AttendanceRecord[];
  markToday: () => void;
  live: boolean;
}

const Ctx = createContext<AttendanceCtx | null>(null);
const todayStr = () => new Date().toISOString().slice(0, 10);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const live = isSupabaseConfigured();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!live) return;
    let unsub = () => {};
    (async () => {
      try {
        const m = await import("@/lib/supabase/attendance-data");
        setRecords(await m.loadAttendance());
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
      } catch {
        // table missing / offline
      }
    })();
    return () => unsub();
  }, [live]);

  const markToday = () => {
    if (!user?.id) return;
    const date = todayStr();
    const checkIn = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const rec: AttendanceRecord = { id: `${user.id}_${date}`, userId: user.id, date, status: "Present", checkIn };
    setRecords((prev) => (prev.some((r) => r.id === rec.id) ? prev : [rec, ...prev]));
    if (live) import("@/lib/supabase/attendance-data").then((m) => m.markPresent(user.id, date, checkIn)).catch(() => {});
  };

  return <Ctx.Provider value={{ records, markToday, live }}>{children}</Ctx.Provider>;
}

export function useAttendance() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAttendance must be used within AttendanceProvider");
  return c;
}
