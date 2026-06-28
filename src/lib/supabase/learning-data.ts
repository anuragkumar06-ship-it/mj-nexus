"use client";

import { createClient } from "./client";
import type { LearningResource } from "@/lib/learning";

function fromRow(r: any): LearningResource {
  return {
    id: r.id,
    title: r.title ?? "",
    description: r.description ?? "",
    type: r.type ?? "Video",
    url: r.url ?? "",
    category: r.category ?? "General",
    level: r.level ?? "Beginner",
    createdAt: (r.created_at ?? "").slice(0, 10),
  };
}
function toRow(r: LearningResource): any {
  return { id: r.id, title: r.title, description: r.description, type: r.type, url: r.url, category: r.category, level: r.level };
}

export async function loadResources(): Promise<LearningResource[]> {
  const { data, error } = await createClient().from("learning_resources").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}
export async function insertResource(r: LearningResource) {
  const { error } = await createClient().from("learning_resources").insert(toRow(r));
  if (error) throw error;
}
export async function deleteResource(id: string) {
  const { error } = await createClient().from("learning_resources").delete().eq("id", id);
  if (error) throw error;
}
export function subscribeResources(onChange: (type: string, obj: LearningResource | { id: string }) => void) {
  const s = createClient();
  const ch = s
    .channel("mj-learning-resources")
    .on("postgres_changes" as any, { event: "*", schema: "public", table: "learning_resources" }, (p: any) =>
      onChange(p.eventType, p.eventType === "DELETE" ? { id: p.old?.id } : fromRow(p.new))
    )
    .subscribe();
  return () => s.removeChannel(ch);
}

export async function loadProgress(userId: string): Promise<Record<string, number>> {
  const { data, error } = await createClient().from("learning_progress").select("resource_id,progress").eq("user_id", userId);
  if (error) throw error;
  const m: Record<string, number> = {};
  (data ?? []).forEach((r: any) => {
    m[r.resource_id] = r.progress ?? 0;
  });
  return m;
}
export async function upsertProgress(userId: string, resourceId: string, progress: number) {
  const { error } = await createClient()
    .from("learning_progress")
    .upsert({ id: `${userId}_${resourceId}`, user_id: userId, resource_id: resourceId, progress, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}
export function subscribeProgress(userId: string, onChange: (resourceId: string, progress: number) => void) {
  const s = createClient();
  const ch = s
    .channel("mj-learning-progress-" + userId)
    .on(
      "postgres_changes" as any,
      { event: "*", schema: "public", table: "learning_progress", filter: `user_id=eq.${userId}` },
      (p: any) => {
        const row = p.new ?? p.old;
        if (row) onChange(row.resource_id, p.eventType === "DELETE" ? 0 : row.progress ?? 0);
      }
    )
    .subscribe();
  return () => s.removeChannel(ch);
}
