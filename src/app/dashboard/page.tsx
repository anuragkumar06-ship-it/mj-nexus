"use client";

import { useAuth } from "@/components/app/auth";
import { InternHome } from "@/components/dashboard/home/intern-home";
import { LeadHome } from "@/components/dashboard/home/lead-home";
import { HrHome } from "@/components/dashboard/home/hr-home";
import { ManagementHome } from "@/components/dashboard/home/management-home";

export default function DashboardPage() {
  const { role } = useAuth();
  if (role === "intern") return <InternHome />;
  if (role === "lead") return <LeadHome />;
  if (role === "hr") return <HrHome />;
  return <ManagementHome />;
}
