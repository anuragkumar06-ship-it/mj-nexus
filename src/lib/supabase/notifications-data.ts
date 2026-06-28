"use client";

import { createClient } from "./client";

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  text: string;
  href?: string;
  read: boolean;
  createdAt?: string;
}

const newId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `n${Date.now()}`);

function fromRow(r: any): AppNotification {
  return {
    id: r.id,
    userId: r.user_id ?? "",
    type: r.type ?? "info",
    text: r.text ?? "",
    href: r.href ?? undefined,
    read: !!r.read,
    createdAt: r.created_at,
  };
}

/** Create a notification for a recipient. Fire-and-forget. */
export async function notify(userId: string, text: string, opts?: { type?: string; href?: string }) {
  if (!userId) return;
  try {
    await createClient().from("notifications").insert({
      id: newId(),
      user_id: userId,
      type: opts?.type ?? "info",
      text,
      href: opts?.href ?? null,
      read: false,
    });
  } catch {
    /* ignore (e.g. non-uuid recipient or table missing) */
  }
}

export async function loadNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await createClient()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function markAllRead(userId: string) {
  try {
    await createClient().from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  } catch {}
}

export async function clearAll(userId: string) {
  try {
    await createClient().from("notifications").delete().eq("user_id", userId);
  } catch {}
}

export function subscribeNotifications(userId: string, onChange: (type: string, obj: AppNotification | { id: string }) => void) {
  const s = createClient();
  const ch = s
    .channel("mj-notifications-" + userId)
    .on(
      "postgres_changes" as any,
      { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      (p: any) => onChange(p.eventType, p.eventType === "DELETE" ? { id: p.old?.id } : fromRow(p.new))
    )
    .subscribe();
  return () => s.removeChannel(ch);
}
