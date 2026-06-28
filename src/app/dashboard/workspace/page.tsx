"use client";

import { useState } from "react";
import { ClipboardList, ClipboardCheck } from "lucide-react";
import { RoleGate } from "@/components/app/role-gate";
import { PageHeader } from "@/components/dashboard/page-header";
import { useAuth } from "@/components/app/auth";
import { InternWork } from "@/components/dashboard/work/intern-work";
import { LeadReviews } from "@/components/dashboard/work/lead-reviews";
import { cn } from "@/lib/utils";

export default function WorkspacePage() {
  const { role } = useAuth();
  const hasMine = role !== "management"; // intern/lead/hr submit their own work
  const hasReviews = role !== "intern"; // lead/hr/management review their reports
  const [tab, setTab] = useState<"mine" | "reviews">(hasMine ? "mine" : "reviews");

  const title =
    role === "intern" ? "My Work" : role === "management" ? "Task Reviews" : "Tasks & Reviews";
  const description =
    role === "intern"
      ? "Track your tasks and submit your work with real screenshots & files - your lead reviews every submission."
      : role === "management"
      ? "Review and approve task submissions from your leads & HR, and assign them new work."
      : "Submit your own tasks to management for approval, and review your team's submissions.";

  const showMine = !hasReviews || (hasMine && tab === "mine");

  return (
    <RoleGate allow={["intern", "lead", "hr", "management"]}>
      <PageHeader eyebrow="Workspace" title={title} description={description} />

      {hasMine && hasReviews && (
        <div className="mb-5 inline-flex rounded-2xl border border-navy/5 bg-white p-1 shadow-card">
          <button
            onClick={() => setTab("mine")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
              tab === "mine" ? "bg-gradient-brand text-white" : "text-navy/60 hover:text-navy"
            )}
          >
            <ClipboardList className="h-4 w-4" /> My Tasks
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
              tab === "reviews" ? "bg-gradient-brand text-white" : "text-navy/60 hover:text-navy"
            )}
          >
            <ClipboardCheck className="h-4 w-4" /> Team Reviews
          </button>
        </div>
      )}

      {showMine ? <InternWork /> : <LeadReviews />}
    </RoleGate>
  );
}
