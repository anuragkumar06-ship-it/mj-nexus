"use client";

import { createClient } from "./client";
import type {
  Task,
  Submission,
  Standup,
  ApprovalRequest,
  Feedback,
} from "@/components/app/store";

export type Entity = "tasks" | "submissions" | "standups" | "requests" | "feedback";
export type ChangeType = "INSERT" | "UPDATE" | "DELETE";

/** camelCase (app) <-> snake_case (DB) column maps per table. */
const COLS: Record<Entity, Record<string, string>> = {
  tasks: { title: "title", description: "description", assigneeId: "assignee_id", assignerId: "assigner_id", team: "team", status: "status", priority: "priority", due: "due", tag: "tag", submissionId: "submission_id" },
  submissions: { taskId: "task_id", internId: "intern_id", note: "note", files: "files", status: "status", reviewNote: "review_note", submittedAt: "submitted_at" },
  standups: { internId: "intern_id", completed: "completed", priorities: "priorities", challenges: "challenges", date: "date" },
  requests: { type: "type", title: "title", detail: "detail", requesterId: "requester_id", approverId: "approver_id", status: "status", files: "files", decisionNote: "decision_note", createdAt: "created_at_label", fromDate: "from_date", toDate: "to_date", reason: "reason", leaveType: "leave_type", grantedType: "granted_type", followUp: "follow_up" },
  feedback: { internId: "intern_id", fromId: "from_id", rating: "rating", note: "note", date: "date" },
};

function toRow(entity: Entity, obj: Record<string, any>): Record<string, any> {
  const cols = COLS[entity];
  const row: Record<string, any> = {};
  if (obj.id !== undefined) row.id = obj.id;
  for (const k in cols) if (obj[k] !== undefined) row[cols[k]] = obj[k];
  return row;
}

function fromRow(entity: Entity, row: any): any {
  const cols = COLS[entity];
  const obj: Record<string, any> = { id: row.id };
  for (const k in cols) obj[k] = row[cols[k]] ?? undefined;
  if (entity === "submissions" || entity === "requests") obj.files = Array.isArray(obj.files) ? obj.files : [];
  return obj;
}

export async function loadAll(): Promise<{
  tasks: Task[];
  submissions: Submission[];
  standups: Standup[];
  requests: ApprovalRequest[];
  feedback: Feedback[];
}> {
  const s = createClient();
  const [t, sub, st, rq, fb] = await Promise.all([
    s.from("tasks").select("*").order("created_at", { ascending: false }),
    s.from("submissions").select("*").order("created_at", { ascending: false }),
    s.from("standups").select("*").order("created_at", { ascending: false }),
    s.from("requests").select("*").order("created_at", { ascending: false }),
    s.from("feedback").select("*").order("created_at", { ascending: false }),
  ]);
  const err = t.error || sub.error || st.error || rq.error || fb.error;
  if (err) throw err;
  return {
    tasks: (t.data ?? []).map((r) => fromRow("tasks", r)) as Task[],
    submissions: (sub.data ?? []).map((r) => fromRow("submissions", r)) as Submission[],
    standups: (st.data ?? []).map((r) => fromRow("standups", r)) as Standup[],
    requests: (rq.data ?? []).map((r) => fromRow("requests", r)) as ApprovalRequest[],
    feedback: (fb.data ?? []).map((r) => fromRow("feedback", r)) as Feedback[],
  };
}

export async function dbInsert(entity: Entity, obj: Record<string, any>) {
  const { error } = await createClient().from(entity).insert(toRow(entity, obj));
  if (error) throw error;
}

export async function dbUpdate(entity: Entity, id: string, patch: Record<string, any>) {
  const { error } = await createClient().from(entity).update(toRow(entity, patch)).eq("id", id);
  if (error) throw error;
}

export async function dbDelete(entity: Entity, id: string) {
  const { error } = await createClient().from(entity).delete().eq("id", id);
  if (error) throw error;
}

/** Subscribe to realtime changes across all workflow tables. Returns an unsubscribe fn. */
export function subscribeAll(onChange: (entity: Entity, type: ChangeType, obj: any) => void) {
  const s = createClient();
  const channel = s.channel("mj-nexus-realtime");
  (["tasks", "submissions", "standups", "requests", "feedback"] as Entity[]).forEach((entity) => {
    channel.on(
      "postgres_changes" as any,
      { event: "*", schema: "public", table: entity },
      (payload: any) => {
        const type = payload.eventType as ChangeType;
        if (type === "DELETE") onChange(entity, type, { id: payload.old?.id });
        else onChange(entity, type, fromRow(entity, payload.new));
      }
    );
  });
  channel.subscribe();
  return () => {
    s.removeChannel(channel);
  };
}
