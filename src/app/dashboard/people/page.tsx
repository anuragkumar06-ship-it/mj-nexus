"use client";

import { RoleGate } from "@/components/app/role-gate";
import { PageHeader } from "@/components/dashboard/page-header";
import { PeopleDirectory } from "@/components/dashboard/people/people-directory";

export default function PeoplePage() {
  return (
    <RoleGate allow={["management"]}>
      <PageHeader
        eyebrow="Management"
        title="People Directory"
        description="Company-wide oversight — drill into any intern, team lead, or HR member for their individual data, or scan the org summary."
      />
      <PeopleDirectory />
    </RoleGate>
  );
}
