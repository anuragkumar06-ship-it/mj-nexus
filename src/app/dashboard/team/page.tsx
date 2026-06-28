"use client";

import { RoleGate } from "@/components/app/role-gate";
import { PageHeader } from "@/components/dashboard/page-header";
import { TeamView } from "@/components/dashboard/team/team-view";

export default function TeamPage() {
  return (
    <RoleGate allow={["lead"]}>
      <PageHeader
        eyebrow="Team Lead"
        title="My Team"
        description="Manage your pod - review performance, drill into each intern, share feedback, and escalate headcount to management."
      />
      <TeamView />
    </RoleGate>
  );
}
