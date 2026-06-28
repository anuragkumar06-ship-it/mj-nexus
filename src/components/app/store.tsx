"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/config";

/* ---------------- Types ---------------- */
export interface Attachment {
  name: string;
  size: number;
  type: string;
  url?: string;
}
export type TaskStatus = "To Do" | "In Progress" | "Submitted" | "Approved";
export type Priority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  assignerId: string;
  team: string;
  status: TaskStatus;
  priority: Priority;
  due: string;
  tag: string;
  submissionId?: string;
}
export interface Submission {
  id: string;
  taskId: string;
  internId: string;
  note: string;
  files: Attachment[];
  submittedAt: string;
  status: "Pending Review" | "Approved" | "Changes Requested";
  reviewNote?: string;
}
export interface Standup {
  id: string;
  internId: string;
  completed: string;
  priorities: string;
  challenges: string;
  date: string;
}
export type ReqStatus = "Pending" | "Approved" | "Rejected";
export interface ApprovalRequest {
  id: string;
  type: string;
  title: string;
  detail: string;
  requesterId: string;
  approverId: string;
  status: ReqStatus;
  createdAt: string;
  files?: Attachment[];
  decisionNote?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  leaveType?: string;
  grantedType?: string;
}
export interface Feedback {
  id: string;
  internId: string;
  fromId: string;
  rating: number;
  note: string;
  date: string;
}

/* ---------------- Seeds (fallback + demo) ---------------- */
const seedTasks: Task[] = [
  { id: "t1", title: "Draft Q3 social content calendar", assigneeId: "i1", assignerId: "l1", team: "Growth", status: "In Progress", priority: "High", due: "Jun 28", tag: "Content" },
  { id: "t2", title: "Launch landing-page hero A/B test", assigneeId: "i2", assignerId: "l1", team: "Growth", status: "Submitted", priority: "High", due: "Jun 27", tag: "Growth", submissionId: "sub1" },
  { id: "t3", title: "Design brand refresh deck", assigneeId: "i3", assignerId: "l2", team: "Brand", status: "Approved", priority: "Low", due: "Jun 24", tag: "Brand", submissionId: "sub2" },
  { id: "t4", title: "Edit recruitment highlight reel", assigneeId: "i4", assignerId: "l2", team: "Brand", status: "In Progress", priority: "Medium", due: "Jun 28", tag: "Content" },
  { id: "t5", title: "Build sales outreach sequence", assigneeId: "i5", assignerId: "l3", team: "Revenue", status: "To Do", priority: "High", due: "Jun 30", tag: "Revenue" },
  { id: "t6", title: "Update CRM lead scoring model", assigneeId: "i6", assignerId: "l3", team: "Revenue", status: "Submitted", priority: "Medium", due: "Jun 29", tag: "Revenue", submissionId: "sub3" },
  { id: "t7", title: "Prepare onboarding kit v2", assigneeId: "i7", assignerId: "h1", team: "People Ops", status: "In Progress", priority: "Medium", due: "Jul 01", tag: "People Ops" },
  { id: "t8", title: "Screen 20 marketing applicants", assigneeId: "i8", assignerId: "h1", team: "People Ops", status: "To Do", priority: "High", due: "Jun 27", tag: "Recruitment" },
  { id: "t9", title: "Competitor SEO audit", assigneeId: "i1", assignerId: "l1", team: "Growth", status: "To Do", priority: "Medium", due: "Jul 02", tag: "Growth" },
  { id: "t10", title: "Weekly performance report", assigneeId: "i2", assignerId: "l1", team: "Growth", status: "In Progress", priority: "Low", due: "Jun 30", tag: "Analytics" },
];
const seedSubmissions: Submission[] = [
  { id: "sub1", taskId: "t2", internId: "i2", note: "A/B test is live — variant B lifted CTR by 14%. Dashboard screenshot attached.", files: [{ name: "ab-test-results.png", size: 184320, type: "image/png" }], submittedAt: "2026-06-26", status: "Pending Review" },
  { id: "sub2", taskId: "t3", internId: "i3", note: "Final brand refresh deck v3 attached.", files: [{ name: "brand-refresh-v3.pdf", size: 982400, type: "application/pdf" }], submittedAt: "2026-06-24", status: "Approved", reviewNote: "Excellent — ship it." },
  { id: "sub3", taskId: "t6", internId: "i6", note: "Updated scoring weights and added 2 new signals.", files: [{ name: "crm-scoring.png", size: 220160, type: "image/png" }], submittedAt: "2026-06-26", status: "Pending Review" },
];
const seedStandups: Standup[] = [
  { id: "s1", internId: "i1", completed: "Shipped 6 social posts; finalized June report", priorities: "Q3 calendar, competitor audit", challenges: "Waiting on brand asset approvals", date: "Today" },
  { id: "s2", internId: "i2", completed: "Launched hero A/B test; +14% CTR", priorities: "Analyze variant data", challenges: "Sample size still small", date: "Today" },
  { id: "s3", internId: "i7", completed: "Screened 18 candidates; 5 shortlisted", priorities: "Schedule HR interviews", challenges: "Calendar conflicts with leads", date: "Today" },
];
const seedRequests: ApprovalRequest[] = [
  { id: "r1", type: "Deadline Extension", title: "2-day extension on Q3 calendar", detail: "Brand assets are delayed — requesting 2 extra days to deliver the Q3 content calendar.", requesterId: "i1", approverId: "l1", status: "Pending", createdAt: "Today" },
  { id: "r2", type: "Leave", title: "Leave request — 2 days", detail: "Personal leave on Jun 30 and Jul 1.", requesterId: "i5", approverId: "l3", status: "Pending", createdAt: "Today" },
  { id: "r3", type: "Hiring Approval", title: "Final offer — Arjun Kumar (Growth)", detail: "Candidate cleared all rounds (interview 91, Strong Hire). Requesting management sign-off to extend the final offer.", requesterId: "h1", approverId: "m1", status: "Pending", createdAt: "Yesterday" },
  { id: "r4", type: "Headcount", title: "Add 1 Brand intern for Q3", detail: "Brand team is at capacity. Requesting approval to open 1 additional Brand internship seat.", requesterId: "l2", approverId: "m1", status: "Pending", createdAt: "Yesterday" },
  { id: "r5", type: "Resource", title: "Canva Pro license", detail: "Requesting a Canva Pro seat for design tasks.", requesterId: "i7", approverId: "h1", status: "Pending", createdAt: "Today" },
  { id: "r6", type: "Leave", title: "Leave request — 1 day", detail: "Half-day on Jun 27.", requesterId: "i2", approverId: "l1", status: "Approved", createdAt: "2 days ago", decisionNote: "Approved — enjoy!" },
];
const seedFeedback: Feedback[] = [
  { id: "f1", internId: "i1", fromId: "l1", rating: 5, note: "Exceptional ownership leading the growth pod. Keep raising the bar.", date: "Jun 22" },
  { id: "f2", internId: "i2", fromId: "l1", rating: 4, note: "Strong analytical work — tighten delivery timelines slightly.", date: "Jun 20" },
  { id: "f3", internId: "i5", fromId: "l3", rating: 3, note: "Good effort; focus on deadline adherence this sprint.", date: "Jun 19" },
];

/* ---------------- Context ---------------- */
interface AppCtx {
  tasks: Task[];
  submissions: Submission[];
  standups: Standup[];
  requests: ApprovalRequest[];
  feedback: Feedback[];
  live: boolean;
  assignTask: (t: Omit<Task, "id" | "status" | "submissionId"> & { status?: TaskStatus }) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  submitTask: (taskId: string, internId: string, note: string, files: Attachment[]) => void;
  reviewSubmission: (submissionId: string, decision: "Approved" | "Changes Requested", note: string) => void;
  addStandup: (s: Omit<Standup, "id">) => void;
  createRequest: (r: Omit<ApprovalRequest, "id" | "status" | "createdAt">) => void;
  decideRequest: (id: string, decision: "Approved" | "Rejected", note?: string) => void;
  updateRequest: (id: string, patch: Partial<ApprovalRequest>) => void;
  deleteRequest: (id: string) => void;
  addFeedback: (f: Omit<Feedback, "id" | "date">) => void;
}

const Ctx = createContext<AppCtx | null>(null);
const STORAGE_KEY = "mj_nexus_data_v1";

function cleanBlobUrls<T extends { files?: Attachment[] }>(items: T[]): T[] {
  return items.map((it) =>
    it.files ? { ...it, files: it.files.map((f) => (f.url?.startsWith("blob:") ? { ...f, url: undefined } : f)) } : it
  );
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const live = isSupabaseConfigured();
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [submissions, setSubmissions] = useState<Submission[]>(seedSubmissions);
  const [standups, setStandups] = useState<Standup[]>(seedStandups);
  const [requests, setRequests] = useState<ApprovalRequest[]>(seedRequests);
  const [feedback, setFeedback] = useState<Feedback[]>(seedFeedback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    let active = true;
    (async () => {
      if (live) {
        try {
          const { loadAll, subscribeAll } = await import("@/lib/supabase/data");
          const data = await loadAll();
          if (active) {
            // Only adopt DB data if it has rows (so an unseeded DB doesn't blank the UI).
            if (data.tasks.length) setTasks(data.tasks);
            if (data.submissions.length) setSubmissions(data.submissions);
            if (data.standups.length) setStandups(data.standups);
            if (data.requests.length) setRequests(data.requests);
            if (data.feedback.length) setFeedback(data.feedback);
          }
          const upsert = <T extends { id: string }>(setter: (u: (prev: T[]) => T[]) => void) => (obj: any, type: string) =>
            setter((prev) => {
              if (type === "DELETE") return prev.filter((x) => x.id !== obj.id);
              const i = prev.findIndex((x) => x.id === obj.id);
              if (i >= 0) {
                const c = [...prev];
                c[i] = obj;
                return c;
              }
              return [obj, ...prev];
            });
          const apply: Record<string, (o: any, t: string) => void> = {
            tasks: upsert(setTasks),
            submissions: upsert(setSubmissions),
            standups: upsert(setStandups),
            requests: upsert(setRequests),
            feedback: upsert(setFeedback),
          };
          unsub = subscribeAll((entity, type, obj) => apply[entity]?.(obj, type));
        } catch {
          // DB unavailable — keep seed data so the app still works.
        }
      } else {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const d = JSON.parse(raw);
            if (Array.isArray(d.tasks)) setTasks(d.tasks);
            if (Array.isArray(d.submissions)) setSubmissions(cleanBlobUrls(d.submissions));
            if (Array.isArray(d.standups)) setStandups(d.standups);
            if (Array.isArray(d.requests)) setRequests(cleanBlobUrls(d.requests));
            if (Array.isArray(d.feedback)) setFeedback(d.feedback);
          }
        } catch {}
      }
      if (active) setHydrated(true);
    })();
    return () => {
      active = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Demo persistence to localStorage (live mode persists to the DB instead).
  useEffect(() => {
    if (!hydrated || live) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, submissions, standups, requests, feedback }));
    } catch {}
  }, [hydrated, live, tasks, submissions, standups, requests, feedback]);

  const write = async (fn: () => Promise<void>) => {
    if (!live) return;
    try {
      await fn();
    } catch {
      // optimistic UI already applied; ignore transient DB errors
    }
  };
  const dbInsert = async (e: any, o: any) => write(async () => (await import("@/lib/supabase/data")).dbInsert(e, o));
  const dbUpdate = async (e: any, id: string, p: any) => write(async () => (await import("@/lib/supabase/data")).dbUpdate(e, id, p));
  const dbDelete = async (e: any, id: string) => write(async () => (await import("@/lib/supabase/data")).dbDelete(e, id));
  const pushNotif = (userId: string | undefined, text: string, type: string, href: string) => {
    if (live && userId) import("@/lib/supabase/notifications-data").then((m) => m.notify(userId, text, { type, href })).catch(() => {});
  };

  const assignTask: AppCtx["assignTask"] = (t) => {
    const task: Task = { ...t, id: `t${Date.now()}`, status: t.status ?? "To Do" };
    setTasks((prev) => [task, ...prev]);
    dbInsert("tasks", task);
  };
  const setTaskStatus: AppCtx["setTaskStatus"] = (id, status) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    dbUpdate("tasks", id, { status });
  };
  const submitTask: AppCtx["submitTask"] = (taskId, internId, note, files) => {
    const id = `sub${Date.now()}`;
    const sub: Submission = { id, taskId, internId, note, files, submittedAt: "Just now", status: "Pending Review" };
    setSubmissions((prev) => [sub, ...prev]);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "Submitted", submissionId: id } : t)));
    dbInsert("submissions", sub);
    dbUpdate("tasks", taskId, { status: "Submitted", submissionId: id });
    const task = tasks.find((t) => t.id === taskId);
    pushNotif(task?.assignerId, `New submission to review: "${task?.title ?? "a task"}"`, "submission", "/dashboard/workspace");
  };
  const reviewSubmission: AppCtx["reviewSubmission"] = (submissionId, decision, note) => {
    const sub = submissions.find((s) => s.id === submissionId);
    setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, status: decision, reviewNote: note } : s)));
    if (sub) setTasks((prev) => prev.map((t) => (t.id === sub.taskId ? { ...t, status: decision === "Approved" ? "Approved" : "In Progress" } : t)));
    dbUpdate("submissions", submissionId, { status: decision, reviewNote: note });
    if (sub) dbUpdate("tasks", sub.taskId, { status: decision === "Approved" ? "Approved" : "In Progress" });
    if (sub) {
      const t = tasks.find((x) => x.id === sub.taskId);
      pushNotif(sub.internId, `Your work on "${t?.title ?? "a task"}" was ${decision === "Approved" ? "approved" : "sent back for changes"}`, decision === "Approved" ? "success" : "info", "/dashboard/workspace");
    }
  };
  const addStandup: AppCtx["addStandup"] = (s) => {
    const row: Standup = { ...s, id: `s${Date.now()}` };
    setStandups((prev) => [row, ...prev]);
    dbInsert("standups", row);
  };
  const createRequest: AppCtx["createRequest"] = (r) => {
    const row: ApprovalRequest = { ...r, id: `r${Date.now()}`, status: "Pending", createdAt: "Just now" };
    setRequests((prev) => [row, ...prev]);
    dbInsert("requests", row);
    pushNotif(row.approverId, `New ${row.type} request: ${row.title}`, "request", "/dashboard/approvals");
  };
  const decideRequest: AppCtx["decideRequest"] = (id, decision, note) => {
    const req = requests.find((x) => x.id === id);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: decision, decisionNote: note } : r)));
    dbUpdate("requests", id, { status: decision, decisionNote: note });
    pushNotif(req?.requesterId, `Your request "${req?.title ?? ""}" was ${decision.toLowerCase()}`, decision === "Approved" ? "success" : "info", "/dashboard/approvals");
  };
  const updateRequest: AppCtx["updateRequest"] = (id, patch) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    dbUpdate("requests", id, patch);
  };
  const deleteRequest: AppCtx["deleteRequest"] = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    dbDelete("requests", id);
  };
  const addFeedback: AppCtx["addFeedback"] = (f) => {
    const row: Feedback = { ...f, id: `f${Date.now()}`, date: "Just now" };
    setFeedback((prev) => [row, ...prev]);
    dbInsert("feedback", row);
  };

  return (
    <Ctx.Provider
      value={{ tasks, submissions, standups, requests, feedback, live, assignTask, setTaskStatus, submitTask, reviewSubmission, addStandup, createRequest, decideRequest, updateRequest, deleteRequest, addFeedback }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppStoreProvider");
  return ctx;
}
