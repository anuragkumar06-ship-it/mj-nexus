/* ============================================================
   MJ NEXUS — Organization model
   The people directory that interconnects every role:
   Interns -> Team Leads / HR -> Management
   ============================================================ */

export type Role = "intern" | "lead" | "hr" | "management";

export const ROLE_META: Record<
  Role,
  { label: string; short: string; tagline: string; accent: string }
> = {
  intern: {
    label: "Intern",
    short: "Intern",
    tagline: "Your work, growth & learning",
    accent: "#1D7FFF",
  },
  lead: {
    label: "Team Lead",
    short: "Lead",
    tagline: "Lead your team & review work",
    accent: "#0A6BEF",
  },
  hr: {
    label: "HR Team",
    short: "HR",
    tagline: "Recruit, onboard & certify talent",
    accent: "#6BC5FF",
  },
  management: {
    label: "Management",
    short: "Mgmt",
    tagline: "Company-wide oversight & approvals",
    accent: "#050B3D",
  },
};

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  title: string;
  team?: string;
  managerId?: string; // the lead/HR they report to
  performance?: number;
  reliability?: number;
  growth?: number;
  attendance?: number;
  tasksDone?: number;
  tasksTotal?: number;
  joined: string;
}

/* ---- Management ---- */
const management: Person[] = [
  {
    id: "m1",
    name: "M. Joshi",
    email: "founder@mjconsultancy.com",
    phone: "+91 98200 10000",
    role: "management",
    title: "Founder & CEO",
    joined: "2024-01-05",
  },
];

/* ---- Team Leads ---- */
const leads: Person[] = [
  { id: "l1", name: "Neha Kapoor", email: "neha@mjconsultancy.com", phone: "+91 98201 22001", role: "lead", title: "Growth Lead", team: "Growth", managerId: "m1", joined: "2024-06-10" },
  { id: "l2", name: "Priya Menon", email: "priya@mjconsultancy.com", phone: "+91 98201 22002", role: "lead", title: "Brand Lead", team: "Brand", managerId: "m1", joined: "2024-08-22" },
  { id: "l3", name: "Rahul Saxena", email: "rahul@mjconsultancy.com", phone: "+91 98201 22003", role: "lead", title: "Revenue Lead", team: "Revenue", managerId: "m1", joined: "2024-09-15" },
];

/* ---- HR Team ---- */
const hr: Person[] = [
  { id: "h1", name: "Anurag Kumar", email: "anurag@mjconsultancy.com", phone: "+91 98202 33001", role: "hr", title: "HR Associate", team: "People Ops", managerId: "m1", joined: "2025-01-12" },
  { id: "h2", name: "Sneha Rao", email: "sneha@mjconsultancy.com", phone: "+91 98202 33002", role: "hr", title: "HR Associate", team: "People Ops", managerId: "m1", joined: "2025-02-20" },
];

/* ---- Interns ---- */
const interns: Person[] = [
  { id: "i1", name: "Ananya Iyer", email: "ananya@mjconsultancy.com", phone: "+91 98203 44001", role: "intern", title: "Marketing Intern", team: "Growth", managerId: "l1", performance: 96, reliability: 98, growth: 91, attendance: 99, tasksDone: 47, tasksTotal: 50, joined: "2026-02-02" },
  { id: "i2", name: "Arjun Kumar", email: "arjun@mjconsultancy.com", phone: "+91 98203 44002", role: "intern", title: "Growth Intern", team: "Growth", managerId: "l1", performance: 90, reliability: 89, growth: 94, attendance: 95, tasksDone: 38, tasksTotal: 44, joined: "2026-02-16" },
  { id: "i3", name: "Vihaan Desai", email: "vihaan@mjconsultancy.com", phone: "+91 98203 44003", role: "intern", title: "Brand Intern", team: "Brand", managerId: "l2", performance: 87, reliability: 90, growth: 85, attendance: 96, tasksDone: 34, tasksTotal: 42, joined: "2026-03-01" },
  { id: "i4", name: "Navya Menon", email: "navya@mjconsultancy.com", phone: "+91 98203 44004", role: "intern", title: "Content Intern", team: "Brand", managerId: "l2", performance: 88, reliability: 86, growth: 90, attendance: 93, tasksDone: 33, tasksTotal: 40, joined: "2026-03-10" },
  { id: "i5", name: "Rohan Mehta", email: "rohan@mjconsultancy.com", phone: "+91 98203 44005", role: "intern", title: "Sales Intern", team: "Revenue", managerId: "l3", performance: 81, reliability: 83, growth: 79, attendance: 91, tasksDone: 28, tasksTotal: 38, joined: "2026-03-18" },
  { id: "i6", name: "Kabir Singh", email: "kabir@mjconsultancy.com", phone: "+91 98203 44006", role: "intern", title: "Sales Intern", team: "Revenue", managerId: "l3", performance: 76, reliability: 80, growth: 74, attendance: 89, tasksDone: 24, tasksTotal: 36, joined: "2026-04-02" },
  { id: "i7", name: "Myra Gupta", email: "myra@mjconsultancy.com", phone: "+91 98203 44007", role: "intern", title: "HR Intern", team: "People Ops", managerId: "h1", performance: 92, reliability: 95, growth: 88, attendance: 97, tasksDone: 41, tasksTotal: 46, joined: "2026-02-09" },
  { id: "i8", name: "Diya Patel", email: "diya@mjconsultancy.com", phone: "+91 98203 44008", role: "intern", title: "HR Intern", team: "People Ops", managerId: "h1", performance: 85, reliability: 88, growth: 86, attendance: 94, tasksDone: 31, tasksTotal: 40, joined: "2026-03-05" },
];

export const people: Person[] = [...management, ...leads, ...hr, ...interns];

/** Default signed-in identity for each role (used by the login demo). */
export const ROLE_IDENTITY: Record<Role, string> = {
  intern: "i1", // Ananya Iyer
  lead: "l1", // Neha Kapoor
  hr: "h1", // Anurag Kumar
  management: "m1", // M. Joshi
};

export function personById(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

/** Interns (and reports) who report to a given lead/HR id. */
export function reportsOf(managerId: string): Person[] {
  return people.filter((p) => p.managerId === managerId);
}

export function internsAll(): Person[] {
  return people.filter((p) => p.role === "intern");
}

export function leadsAll(): Person[] {
  return people.filter((p) => p.role === "lead");
}

export function hrAll(): Person[] {
  return people.filter((p) => p.role === "hr");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
