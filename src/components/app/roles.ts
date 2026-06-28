import {
  LayoutDashboard,
  Briefcase,
  Inbox,
  Gauge,
  GraduationCap,
  Award,
  Users,
  ListChecks,
  ScanSearch,
  Video,
  BarChart3,
  UsersRound,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/org";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const roleNav: Record<Role, NavItem[]> = {
  intern: [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Work", href: "/dashboard/workspace", icon: Briefcase },
    { label: "Requests", href: "/dashboard/approvals", icon: Inbox },
    { label: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { label: "Performance", href: "/dashboard/performance", icon: Gauge },
    { label: "Learning", href: "/dashboard/learning", icon: GraduationCap },
    { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  ],
  lead: [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Team", href: "/dashboard/team", icon: Users },
    { label: "Tasks & Reviews", href: "/dashboard/workspace", icon: ListChecks },
    { label: "Recruitment", href: "/dashboard/recruitment", icon: ScanSearch },
    { label: "Approvals", href: "/dashboard/approvals", icon: Inbox },
    { label: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { label: "Performance", href: "/dashboard/performance", icon: Gauge },
    { label: "Learning", href: "/dashboard/learning", icon: GraduationCap },
    { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  ],
  hr: [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Tasks", href: "/dashboard/workspace", icon: ListChecks },
    { label: "Recruitment", href: "/dashboard/recruitment", icon: Users },
    { label: "AI Engine", href: "/dashboard/ai-engine", icon: ScanSearch },
    { label: "Interviews", href: "/dashboard/interviews", icon: Video },
    { label: "Certificates", href: "/dashboard/certificates", icon: Award },
    { label: "Approvals", href: "/dashboard/approvals", icon: Inbox },
    { label: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ],
  management: [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "People", href: "/dashboard/people", icon: UsersRound },
    { label: "Task Reviews", href: "/dashboard/workspace", icon: ListChecks },
    { label: "Approvals", href: "/dashboard/approvals", icon: Inbox },
    { label: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Recruitment", href: "/dashboard/recruitment", icon: ScanSearch },
    { label: "Performance", href: "/dashboard/performance", icon: Gauge },
    { label: "Learning", href: "/dashboard/learning", icon: GraduationCap },
    { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  ],
};

/** Which roles may access a given route (for RoleGate). */
export const routeAccess: Record<string, Role[]> = {
  "/dashboard/workspace": ["intern", "lead", "hr", "management"],
  "/dashboard/team": ["lead", "management"],
  "/dashboard/people": ["management"],
  "/dashboard/recruitment": ["lead", "hr", "management"],
  "/dashboard/ai-engine": ["hr", "management"],
  "/dashboard/interviews": ["hr", "management"],
  "/dashboard/analytics": ["hr", "management"],
  "/dashboard/learning": ["intern", "lead", "hr", "management"],
  "/dashboard/attendance": ["intern", "lead", "hr", "management"],
  "/dashboard/certificates": ["intern", "lead", "hr", "management"],
  "/dashboard/approvals": ["intern", "lead", "hr", "management"],
  "/dashboard/performance": ["intern", "lead", "hr", "management"],
};
