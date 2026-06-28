"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { ApprovalsView } from "@/components/dashboard/approvals/approvals-view";
import { useAuth } from "@/components/app/auth";

export default function ApprovalsPage() {
  const { role } = useAuth();
  const intern = role === "intern";
  return (
    <>
      <PageHeader
        eyebrow="Workflow"
        title={intern ? "My Requests" : "Approvals"}
        description={
          intern
            ? "Raise leave, deadline, or resource requests — they route to your manager for approval."
            : role === "management"
              ? "Sign off on requests escalated by HR and team leads. Teams own their own day-to-day approvals."
              : "Approve requests from your reports, and escalate decisions that need management sign-off."
        }
      />
      <ApprovalsView />
    </>
  );
}
