import {
  LayoutDashboard,
  Users,
  ScanSearch,
  Video,
  Briefcase,
  Gauge,
  Award,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Recruitment", href: "/dashboard/recruitment", icon: Users, badge: "16" },
  { label: "AI Engine", href: "/dashboard/ai-engine", icon: ScanSearch, badge: "AI" },
  { label: "Interviews", href: "/dashboard/interviews", icon: Video },
  { label: "Workspace", href: "/dashboard/workspace", icon: Briefcase },
  { label: "Performance", href: "/dashboard/performance", icon: Gauge },
  { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];
