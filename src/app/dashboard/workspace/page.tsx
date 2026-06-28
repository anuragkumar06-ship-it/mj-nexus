"use client";

import { RoleGate } from "@/components/app/role-gate";
import { PageHeader } from "@/components/dashboard/page-header";
import { useAuth } from "@/components/app/auth";
import { InternWork } from "@/components/dashboard/work/intern-work";
import { LeadReviews } from "@/components/dashboard/work/lead-reviews";

export default function WorkspacePage() {
  const { role } = useAuth();
  const intern = role === "intern";
  return (
    <RoleGate allow={["intern", "lead"]}>
      <PageHeader
        eyebrow="Workspace"
        title={intern ? "My Work" : "Tasks & Reviews"}
        description={
          intern
            ? "Track your tasks and submit your work with real screenshots & files — your lead reviews every submission."
            : "Assign work to your team and review every submission with the attached proof of work."
        }
      />
      {intern ? <InternWork /> : <LeadReviews />}
    </RoleGate>
  );
}
