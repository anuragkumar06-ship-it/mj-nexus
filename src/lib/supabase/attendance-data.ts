"use client";

import { createClient } from "./client";

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: string;
  checkIn?: string;
}

function fromRow(r: any): AttendanceRecord {
  return { id: r.id, userId: r.user_id ?? "", date: r.date ?? "", status: r.status ?? "Present", checkIn: r.check_in ?? undefined };
}

export async function loadAttendance(): Promise<AttendanceRecord[]> {
  const { data, error } = await createClient().from("attendance").select("*").order("date", { ascending: false }).limit(2000);
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function markPresent(userId: string, date: string, checkIn: string) {
  const { error } = await createClient()
    .from("attendance")
    .upsert({ id: `${userId}_${date}`, user_id: userId, date, status: "Present", check_in: checkIn }, { onConflict: "id" });
  if (error) throw error;
}

export function subscribeAttendance(onChange: (type: string, obj: AttendanceRecord | { id: string }) => void) {
  const s = createClient();
  const ch = s
    .channel("mj-attendance-realtime")
    .on("postgres_changes" as any, { event: "*", schema: "public", table: "attendance" }, (p: any) =>
      onChange(p.eventType, p.eventType === "DELETE" ? { id: p.old?.id } : fromRow(p.new))
    )
    .subscribe();
  return () => s.removeChannel(ch);
}
