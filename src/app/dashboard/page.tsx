"use client";

import { useAuth } from "@/components/app/auth";
import { Greeting } from "@/components/dashboard/home/greeting";
import { AnnouncementsBanner } from "@/components/dashboard/announcements";
import { InternHome } from "@/components/dashboard/home/intern-home";
import { LeadHome } from "@/components/dashboard/home/lead-home";
import { HrHome } from "@/components/dashboard/home/hr-home";
import { ManagementHome } from "@/components/dashboard/home/management-home";

export default function DashboardPage() {
  const { role } = useAuth();
  return (
    <div className="space-y-6">
      <Greeting />
      <AnnouncementsBanner />
      {role === "intern" ? <InternHome /> : role === "lead" ? <LeadHome /> : role === "hr" ? <HrHome /> : <ManagementHome />}
    </div>
  );
}
