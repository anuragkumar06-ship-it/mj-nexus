"use client";

import { createClient } from "./client";
import type { Announcement } from "@/lib/announcements";

function fromRow(r: any): Announcement {
  return {
    id: r.id,
    title: r.title ?? "",
    body: r.body ?? "",
    authorId: r.author_id ?? "",
    authorName: r.author_name ?? "",
    createdAt: (r.created_at ?? "").slice(0, 10),
  };
}
function toRow(a: Announcement): any {
  return { id: a.id, title: a.title, body: a.body, author_id: a.authorId, author_name: a.authorName };
}

export async function loadAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await createClient().from("announcements").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}
export async function insertAnnouncement(a: Announcement) {
  const { error } = await createClient().from("announcements").insert(toRow(a));
  if (error) throw error;
}
export async function deleteAnnouncement(id: string) {
  const { error } = await createClient().from("announcements").delete().eq("id", id);
  if (error) throw error;
}
export function subscribeAnnouncements(onChange: (type: string, obj: Announcement | { id: string }) => void) {
  const s = createClient();
  const ch = s
    .channel("mj-announcements-realtime")
    .on("postgres_changes" as any, { event: "*", schema: "public", table: "announcements" }, (p: any) =>
      onChange(p.eventType, p.eventType === "DELETE" ? { id: p.old?.id } : fromRow(p.new))
    )
    .subscribe();
  return () => s.removeChannel(ch);
}
