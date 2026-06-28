"use client";

import { createClient } from "./client";
import type { Person, Role } from "@/lib/org";

function fromRow(r: any): Person {
  return {
    id: r.id,
    name: r.name ?? (r.email ? String(r.email).split("@")[0] : "User"),
    email: r.email ?? "",
    phone: r.phone ?? "",
    role: (r.role ?? "intern") as Role,
    title: r.title ?? roleTitle(r.role),
    team: r.team ?? undefined,
    managerId: r.manager_id ?? undefined,
    performance: r.performance ?? undefined,
    reliability: r.reliability ?? undefined,
    growth: r.growth ?? undefined,
    attendance: r.attendance ?? undefined,
    joined: (r.created_at ?? "").slice(0, 10),
  };
}

function roleTitle(role?: string) {
  if (role === "management") return "Management";
  if (role === "lead") return "Team Lead";
  if (role === "hr") return "HR Associate";
  return "Intern";
}

export interface ProfilePatch {
  role?: Role;
  team?: string | null;
  managerId?: string | null;
  title?: string | null;
  name?: string;
}

export async function loadProfiles(): Promise<Person[]> {
  const { data, error } = await createClient()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function updateProfile(id: string, patch: ProfilePatch) {
  const row: Record<string, any> = {};
  if (patch.role !== undefined) row.role = patch.role;
  if (patch.team !== undefined) row.team = patch.team;
  if (patch.managerId !== undefined) row.manager_id = patch.managerId;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.name !== undefined) row.name = patch.name;
  const { error } = await createClient().from("profiles").update(row).eq("id", id);
  if (error) throw error;
}

export async function createProfile(p: Person) {
  const row = {
    id: p.id,
    name: p.name,
    email: p.email || null,
    phone: p.phone || null,
    role: p.role,
    title: p.title || null,
    team: p.team || null,
    manager_id: p.managerId || null,
    performance: p.performance ?? null,
    reliability: p.reliability ?? null,
    growth: p.growth ?? null,
    attendance: p.attendance ?? null,
  };
  const { error } = await createClient().from("profiles").insert(row);
  if (error) throw error;
}

export async function removeProfile(id: string) {
  const { error } = await createClient().from("profiles").delete().eq("id", id);
  if (error) throw error;
}

export function subscribeProfiles(onChange: () => void) {
  const s = createClient();
  const channel = s
    .channel("mj-profiles-realtime")
    .on("postgres_changes" as any, { event: "*", schema: "public", table: "profiles" }, () => onChange())
    .subscribe();
  return () => {
    s.removeChannel(channel);
  };
}
