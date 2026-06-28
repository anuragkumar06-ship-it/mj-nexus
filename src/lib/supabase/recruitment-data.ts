"use client";

import { createClient } from "./client";
import type { Candidate, Interview } from "@/lib/data";

function candFromRow(r: any): Candidate {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    college: r.college ?? "—",
    state: r.state ?? "—",
    source: r.source ?? "Website",
    stage: r.stage ?? "Applied",
    fitScore: r.fit_score ?? 0,
    appliedDate: (r.created_at ?? "").slice(0, 10),
    experience: r.experience ?? "Fresher",
    skills: Array.isArray(r.skills) ? r.skills : [],
    email: r.email ?? "",
    resumeUrl: r.resume_url ?? undefined,
    resumeName: r.resume_name ?? undefined,
    internStart: r.intern_start ?? undefined,
    internEnd: r.intern_end ?? undefined,
  };
}
function candToRow(c: Candidate): any {
  return { id: c.id, name: c.name, role: c.role, college: c.college, state: c.state, source: c.source, stage: c.stage, fit_score: c.fitScore, experience: c.experience, skills: c.skills, email: c.email, resume_url: c.resumeUrl ?? null, resume_name: c.resumeName ?? null, intern_start: c.internStart ?? null, intern_end: c.internEnd ?? null };
}
function ivFromRow(r: any): Interview {
  return { id: r.id, candidate: r.candidate, role: r.role, date: r.date, time: r.time, interviewer: r.interviewer, mode: r.mode, status: r.status ?? "Upcoming", score: r.score ?? undefined };
}
function ivToRow(i: Interview): any {
  return { id: i.id, candidate: i.candidate, role: i.role, date: i.date, time: i.time, interviewer: i.interviewer, mode: i.mode, status: i.status, score: i.score ?? null };
}

export async function loadCandidates(): Promise<Candidate[]> {
  const { data, error } = await createClient().from("candidates").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(candFromRow);
}
export async function loadInterviews(): Promise<Interview[]> {
  const { data, error } = await createClient().from("interviews").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(ivFromRow);
}
export async function insertCandidate(c: Candidate) {
  const sb = createClient();
  const { error } = await sb.from("candidates").insert(candToRow(c));
  if (!error) return;
  // Fallback: the DB may not have the newer resume/duration columns yet.
  // Retry with only the original core columns so the candidate still saves.
  const core = {
    id: c.id,
    name: c.name,
    role: c.role,
    college: c.college,
    state: c.state,
    source: c.source,
    stage: c.stage,
    fit_score: c.fitScore,
    experience: c.experience,
    skills: c.skills,
    email: c.email,
  };
  const { error: e2 } = await sb.from("candidates").insert(core);
  if (e2) throw e2;
}
export async function deleteCandidate(id: string) {
  const { error } = await createClient().from("candidates").delete().eq("id", id);
  if (error) throw error;
}
export async function updateCandidateStage(id: string, stage: string) {
  const { error } = await createClient().from("candidates").update({ stage }).eq("id", id);
  if (error) throw error;
}
export async function insertInterview(i: Interview) {
  const { error } = await createClient().from("interviews").insert(ivToRow(i));
  if (error) throw error;
}

export function subscribeCandidates(onChange: (type: string, obj: Candidate | { id: string }) => void) {
  const s = createClient();
  const ch = s
    .channel("mj-candidates-realtime")
    .on("postgres_changes" as any, { event: "*", schema: "public", table: "candidates" }, (p: any) =>
      onChange(p.eventType, p.eventType === "DELETE" ? { id: p.old?.id } : candFromRow(p.new))
    )
    .subscribe();
  return () => s.removeChannel(ch);
}
export function subscribeInterviews(onChange: (type: string, obj: Interview | { id: string }) => void) {
  const s = createClient();
  const ch = s
    .channel("mj-interviews-realtime")
    .on("postgres_changes" as any, { event: "*", schema: "public", table: "interviews" }, (p: any) =>
      onChange(p.eventType, p.eventType === "DELETE" ? { id: p.old?.id } : ivFromRow(p.new))
    )
    .subscribe();
  return () => s.removeChannel(ch);
}
