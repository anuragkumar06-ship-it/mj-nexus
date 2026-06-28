/* ============================================================
   MJ NEXUS — Centralized mock data
   Realistic sample data powering all modules (no backend yet).
   ============================================================ */

export type Role = "HR" | "Marketing" | "Sales";
export type Stage =
  | "Applied"
  | "Under Review"
  | "Interview Scheduled"
  | "Selected"
  | "Rejected"
  | "Onboarded";

export interface Candidate {
  id: string;
  name: string;
  role: Role;
  college: string;
  state: string;
  source: "LinkedIn" | "Referral" | "Naukri" | "Campus" | "Website";
  stage: Stage;
  fitScore: number;
  appliedDate: string;
  experience: string;
  skills: string[];
  email: string;
}

export interface Intern {
  id: string;
  name: string;
  role: Role;
  team: string;
  performance: number;
  reliability: number;
  growth: number;
  tasksDone: number;
  tasksTotal: number;
  attendance: number;
  trend: "up" | "down" | "flat";
}

export const BRAND = {
  navy: "#050B3D",
  blue: "#1D7FFF",
  sky: "#6BC5FF",
  offwhite: "#F8FAFC",
};

/** Chart palette derived from the brand identity. */
export const CHART_COLORS = ["#1D7FFF", "#6BC5FF", "#0A6BEF", "#93D5FF", "#0E1A66", "#4D9BFF"];

export const ROLE_COLORS: Record<Role, string> = {
  HR: "#1D7FFF",
  Marketing: "#6BC5FF",
  Sales: "#0A6BEF",
};

export const STAGE_META: { key: Stage; label: string; color: string }[] = [
  { key: "Applied", label: "Applied", color: "#94A3B8" },
  { key: "Under Review", label: "Under Review", color: "#6BC5FF" },
  { key: "Interview Scheduled", label: "Interview", color: "#1D7FFF" },
  { key: "Selected", label: "Selected", color: "#0A6BEF" },
  { key: "Onboarded", label: "Onboarded", color: "#16A34A" },
  { key: "Rejected", label: "Rejected", color: "#F43F5E" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
export { initials };

/* ---------------- Candidates ---------------- */
export const candidates: Candidate[] = [
  { id: "c1", name: "Aarav Sharma", role: "Marketing", college: "IIM Bangalore", state: "Karnataka", source: "LinkedIn", stage: "Interview Scheduled", fitScore: 92, appliedDate: "2026-06-18", experience: "1 yr", skills: ["SEO", "Content", "Analytics", "Canva"], email: "aarav.s@example.com" },
  { id: "c2", name: "Diya Patel", role: "HR", college: "Symbiosis Pune", state: "Maharashtra", source: "Campus", stage: "Selected", fitScore: 88, appliedDate: "2026-06-15", experience: "Fresher", skills: ["Recruitment", "Excel", "Comms"], email: "diya.p@example.com" },
  { id: "c3", name: "Rohan Mehta", role: "Sales", college: "NMIMS Mumbai", state: "Maharashtra", source: "Referral", stage: "Under Review", fitScore: 79, appliedDate: "2026-06-20", experience: "6 mo", skills: ["CRM", "Negotiation", "Outreach"], email: "rohan.m@example.com" },
  { id: "c4", name: "Ananya Iyer", role: "Marketing", college: "Christ University", state: "Karnataka", source: "LinkedIn", stage: "Onboarded", fitScore: 95, appliedDate: "2026-06-02", experience: "1.5 yr", skills: ["Social", "Branding", "Figma", "Ads"], email: "ananya.i@example.com" },
  { id: "c5", name: "Kabir Singh", role: "Sales", college: "SRCC Delhi", state: "Delhi", source: "Naukri", stage: "Applied", fitScore: 71, appliedDate: "2026-06-23", experience: "Fresher", skills: ["B2B", "Cold Calling"], email: "kabir.s@example.com" },
  { id: "c6", name: "Ishita Reddy", role: "HR", college: "XLRI Jamshedpur", state: "Jharkhand", source: "Campus", stage: "Interview Scheduled", fitScore: 90, appliedDate: "2026-06-19", experience: "Fresher", skills: ["Onboarding", "HRIS", "Policy"], email: "ishita.r@example.com" },
  { id: "c7", name: "Vivaan Joshi", role: "Marketing", college: "MICA Ahmedabad", state: "Gujarat", source: "LinkedIn", stage: "Under Review", fitScore: 84, appliedDate: "2026-06-21", experience: "8 mo", skills: ["Copywriting", "Email", "SEO"], email: "vivaan.j@example.com" },
  { id: "c8", name: "Saanvi Nair", role: "Sales", college: "Loyola Chennai", state: "Tamil Nadu", source: "Website", stage: "Applied", fitScore: 68, appliedDate: "2026-06-24", experience: "Fresher", skills: ["Lead Gen", "Excel"], email: "saanvi.n@example.com" },
  { id: "c9", name: "Arjun Kumar", role: "Marketing", college: "IIT Delhi", state: "Delhi", source: "Referral", stage: "Selected", fitScore: 93, appliedDate: "2026-06-12", experience: "1 yr", skills: ["Growth", "SQL", "Analytics", "Ads"], email: "arjun.k@example.com" },
  { id: "c10", name: "Myra Gupta", role: "HR", college: "TISS Mumbai", state: "Maharashtra", source: "Campus", stage: "Onboarded", fitScore: 91, appliedDate: "2026-06-05", experience: "Fresher", skills: ["L&D", "Comms", "Excel"], email: "myra.g@example.com" },
  { id: "c11", name: "Aditya Rao", role: "Sales", college: "Christ University", state: "Karnataka", source: "LinkedIn", stage: "Rejected", fitScore: 54, appliedDate: "2026-06-16", experience: "Fresher", skills: ["Retail"], email: "aditya.r@example.com" },
  { id: "c12", name: "Navya Menon", role: "Marketing", college: "Symbiosis Pune", state: "Maharashtra", source: "Naukri", stage: "Interview Scheduled", fitScore: 86, appliedDate: "2026-06-20", experience: "10 mo", skills: ["Content", "Video", "Social"], email: "navya.m@example.com" },
  { id: "c13", name: "Reyansh Verma", role: "HR", college: "IIM Lucknow", state: "Uttar Pradesh", source: "Campus", stage: "Under Review", fitScore: 82, appliedDate: "2026-06-22", experience: "Fresher", skills: ["TA", "Excel", "Comms"], email: "reyansh.v@example.com" },
  { id: "c14", name: "Aadhya Pillai", role: "Sales", college: "NMIMS Mumbai", state: "Maharashtra", source: "Referral", stage: "Applied", fitScore: 75, appliedDate: "2026-06-24", experience: "6 mo", skills: ["CRM", "Outreach"], email: "aadhya.p@example.com" },
  { id: "c15", name: "Vihaan Desai", role: "Marketing", college: "MICA Ahmedabad", state: "Gujarat", source: "LinkedIn", stage: "Selected", fitScore: 89, appliedDate: "2026-06-14", experience: "1 yr", skills: ["Brand", "Ads", "Figma"], email: "vihaan.d@example.com" },
  { id: "c16", name: "Anika Bose", role: "HR", college: "Jadavpur University", state: "West Bengal", source: "Website", stage: "Applied", fitScore: 73, appliedDate: "2026-06-25", experience: "Fresher", skills: ["Recruitment", "Comms"], email: "anika.b@example.com" },
];

/* ---------------- Recruitment metrics ---------------- */
export const recruitmentKpis = {
  totalApplicants: 1284,
  applicationsThisWeek: 176,
  shortlistingRate: 38,
  interviewRate: 22,
  hiringRate: 9.4,
  avgTimeToHire: 11,
};

export const applicationsByRole = [
  { role: "Marketing", value: 548 },
  { role: "Sales", value: 421 },
  { role: "HR", value: 315 },
];

export const applicationTrend = [
  { week: "W1", applied: 142, interviewed: 31, hired: 9 },
  { week: "W2", applied: 168, interviewed: 38, hired: 12 },
  { week: "W3", applied: 154, interviewed: 35, hired: 11 },
  { week: "W4", applied: 196, interviewed: 47, hired: 15 },
  { week: "W5", applied: 184, interviewed: 44, hired: 14 },
  { week: "W6", applied: 221, interviewed: 53, hired: 18 },
];

export const recruitmentFunnel = [
  { stage: "Applied", value: 1284 },
  { stage: "Under Review", value: 612 },
  { stage: "Interview", value: 287 },
  { stage: "Selected", value: 121 },
  { stage: "Onboarded", value: 94 },
];

/* ---------------- AI Recruitment Engine ---------------- */
export const aiSpotlight = {
  candidate: candidates[0],
  summary:
    "Aarav is a growth-focused marketing candidate with strong hands-on experience in SEO and content analytics. Demonstrated measurable impact (38% organic traffic lift) during a prior internship and communicates with clarity and confidence.",
  fitScore: 92,
  scores: [
    { label: "Relevant Skills", value: 94 },
    { label: "Experience", value: 88 },
    { label: "Communication", value: 90 },
    { label: "Education", value: 96 },
    { label: "Portfolio Quality", value: 89 },
  ],
  strengths: ["Data-driven SEO execution", "Strong written communication", "Owns outcomes end-to-end"],
  gaps: ["Limited paid-ads budget experience", "No team-lead exposure yet"],
  recommendation: "Strong Hire",
  nextSteps: ["Schedule final culture-fit round", "Share marketing case study task", "Verify campaign metrics"],
};

export const aiQueue = candidates
  .filter((c) => ["Applied", "Under Review"].includes(c.stage))
  .map((c) => ({
    ...c,
    parsed: true,
    extractedSkills: c.skills.length,
  }));

/* ---------------- Interviews ---------------- */
export interface Interview {
  id: string;
  candidate: string;
  role: Role;
  date: string;
  time: string;
  interviewer: string;
  mode: "Video" | "In-person" | "Phone";
  status: "Upcoming" | "Completed" | "Pending Review";
  score?: number;
}

export const interviews: Interview[] = [
  { id: "i1", candidate: "Aarav Sharma", role: "Marketing", date: "2026-06-27", time: "10:30 AM", interviewer: "Neha Kapoor", mode: "Video", status: "Upcoming" },
  { id: "i2", candidate: "Ishita Reddy", role: "HR", date: "2026-06-27", time: "01:00 PM", interviewer: "Rahul Saxena", mode: "Video", status: "Upcoming" },
  { id: "i3", candidate: "Navya Menon", role: "Marketing", date: "2026-06-28", time: "11:00 AM", interviewer: "Neha Kapoor", mode: "In-person", status: "Upcoming" },
  { id: "i4", candidate: "Arjun Kumar", role: "Marketing", date: "2026-06-24", time: "03:30 PM", interviewer: "Priya Menon", mode: "Video", status: "Completed", score: 91 },
  { id: "i5", candidate: "Diya Patel", role: "HR", date: "2026-06-23", time: "10:00 AM", interviewer: "Rahul Saxena", mode: "Video", status: "Completed", score: 87 },
  { id: "i6", candidate: "Vihaan Desai", role: "Marketing", date: "2026-06-22", time: "04:00 PM", interviewer: "Priya Menon", mode: "Phone", status: "Pending Review", score: 84 },
];

export const interviewAssessment = {
  candidate: "Arjun Kumar",
  overall: 91,
  metrics: [
    { label: "Communication", value: 92 },
    { label: "Confidence", value: 88 },
    { label: "Technical Depth", value: 90 },
    { label: "Role Fit", value: 94 },
    { label: "Problem Solving", value: 89 },
  ],
  summary:
    "Arjun communicated complex growth experiments with structure and clarity. Showed high ownership and a strong analytical mindset. Confident under pressure with thoughtful, specific examples.",
  recommendation: "Strong Hire",
  sentiment: 0.86,
};

/* ---------------- Interns / Workspace ---------------- */
export const interns: Intern[] = [
  { id: "n1", name: "Ananya Iyer", role: "Marketing", team: "Growth", performance: 96, reliability: 98, growth: 91, tasksDone: 47, tasksTotal: 50, attendance: 99, trend: "up" },
  { id: "n2", name: "Myra Gupta", role: "HR", team: "People Ops", performance: 92, reliability: 95, growth: 88, tasksDone: 41, tasksTotal: 46, attendance: 97, trend: "up" },
  { id: "n3", name: "Arjun Kumar", role: "Marketing", team: "Growth", performance: 90, reliability: 89, growth: 94, tasksDone: 38, tasksTotal: 44, attendance: 95, trend: "up" },
  { id: "n4", name: "Vihaan Desai", role: "Marketing", team: "Brand", performance: 87, reliability: 90, growth: 85, tasksDone: 34, tasksTotal: 42, attendance: 96, trend: "flat" },
  { id: "n5", name: "Diya Patel", role: "HR", team: "People Ops", performance: 85, reliability: 88, growth: 86, tasksDone: 31, tasksTotal: 40, attendance: 94, trend: "up" },
  { id: "n6", name: "Rohan Mehta", role: "Sales", team: "Revenue", performance: 81, reliability: 83, growth: 79, tasksDone: 28, tasksTotal: 38, attendance: 91, trend: "down" },
  { id: "n7", name: "Navya Menon", role: "Marketing", team: "Content", performance: 88, reliability: 86, growth: 90, tasksDone: 33, tasksTotal: 40, attendance: 93, trend: "up" },
  { id: "n8", name: "Kabir Singh", role: "Sales", team: "Revenue", performance: 76, reliability: 80, growth: 74, tasksDone: 24, tasksTotal: 36, attendance: 89, trend: "flat" },
];

export interface Task {
  id: string;
  title: string;
  assignee: string;
  status: "To Do" | "In Progress" | "Review" | "Done";
  priority: "Low" | "Medium" | "High";
  due: string;
  tag: string;
}

export const tasks: Task[] = [
  { id: "t1", title: "Draft Q3 social content calendar", assignee: "Ananya Iyer", status: "In Progress", priority: "High", due: "Jun 28", tag: "Content" },
  { id: "t2", title: "Screen 20 marketing applicants", assignee: "Myra Gupta", status: "In Progress", priority: "High", due: "Jun 27", tag: "Recruitment" },
  { id: "t3", title: "A/B test landing page hero", assignee: "Arjun Kumar", status: "Review", priority: "Medium", due: "Jun 29", tag: "Growth" },
  { id: "t4", title: "Prepare onboarding kit v2", assignee: "Diya Patel", status: "To Do", priority: "Medium", due: "Jul 01", tag: "People Ops" },
  { id: "t5", title: "Design brand refresh deck", assignee: "Vihaan Desai", status: "Done", priority: "Low", due: "Jun 24", tag: "Brand" },
  { id: "t6", title: "Build sales outreach sequence", assignee: "Rohan Mehta", status: "To Do", priority: "High", due: "Jun 30", tag: "Revenue" },
  { id: "t7", title: "Edit recruitment reel", assignee: "Navya Menon", status: "In Progress", priority: "Medium", due: "Jun 28", tag: "Content" },
  { id: "t8", title: "Update CRM lead scoring", assignee: "Kabir Singh", status: "Review", priority: "Medium", due: "Jun 29", tag: "Revenue" },
];

export const standups = [
  { id: "s1", intern: "Ananya Iyer", completed: "Shipped 6 social posts; finalized June report", priorities: "Q3 calendar, competitor audit", challenges: "Need brand asset approvals", date: "Today" },
  { id: "s2", intern: "Arjun Kumar", completed: "Launched hero A/B test; +14% CTR", priorities: "Analyze variant data", challenges: "Sample size still small", date: "Today" },
  { id: "s3", intern: "Myra Gupta", completed: "Screened 18 candidates; 5 shortlisted", priorities: "Schedule HR interviews", challenges: "Calendar conflicts with leads", date: "Today" },
];

export const announcements = [
  { id: "a1", title: "All-hands: Q3 Kickoff", body: "Join the company-wide kickoff on Friday 5 PM.", tag: "Event", time: "2h ago" },
  { id: "a2", title: "New Learning Path: Performance Marketing", body: "12 lessons now live in the Learning hub.", tag: "Learning", time: "1d ago" },
  { id: "a3", title: "Top Intern of the Week 🎉", body: "Congrats Ananya Iyer for leading the growth pod!", tag: "Recognition", time: "2d ago" },
];

export const learningResources = [
  { id: "l1", title: "Performance Marketing 101", lessons: 12, progress: 75, level: "Beginner" },
  { id: "l2", title: "Modern Recruiting Playbook", lessons: 9, progress: 40, level: "Intermediate" },
  { id: "l3", title: "Storytelling for Brands", lessons: 7, progress: 90, level: "Beginner" },
  { id: "l4", title: "Sales Negotiation Mastery", lessons: 10, progress: 25, level: "Advanced" },
];

/* ---------------- Certificates ---------------- */
export interface Certificate {
  id: string;
  recipient: string;
  type: "Completion" | "Appreciation" | "Recommendation";
  role: Role;
  issued: string;
  status: "Issued" | "Generating" | "Draft";
  score: number;
}

export const certificates: Certificate[] = [
  { id: "cer1", recipient: "Ananya Iyer", type: "Completion", role: "Marketing", issued: "2026-06-20", status: "Issued", score: 96 },
  { id: "cer2", recipient: "Myra Gupta", type: "Recommendation", role: "HR", issued: "2026-06-21", status: "Issued", score: 92 },
  { id: "cer3", recipient: "Arjun Kumar", type: "Appreciation", role: "Marketing", issued: "2026-06-24", status: "Generating", score: 90 },
  { id: "cer4", recipient: "Vihaan Desai", type: "Completion", role: "Marketing", issued: "—", status: "Draft", score: 87 },
  { id: "cer5", recipient: "Diya Patel", type: "Recommendation", role: "HR", issued: "—", status: "Draft", score: 85 },
];

export const certificateStats = {
  issued: 142,
  thisMonth: 28,
  recommendations: 64,
  templates: 6,
};

/* ---------------- Analytics ---------------- */
export const conversionRates = [
  { label: "Application → Review", value: 47.6 },
  { label: "Review → Interview", value: 46.9 },
  { label: "Interview → Selected", value: 42.2 },
  { label: "Selected → Onboarded", value: 77.7 },
];

export const sourceEffectiveness = [
  { source: "LinkedIn", applicants: 486, hires: 34 },
  { source: "Campus", applicants: 312, hires: 28 },
  { source: "Referral", applicants: 214, hires: 22 },
  { source: "Naukri", applicants: 168, hires: 7 },
  { source: "Website", applicants: 104, hires: 3 },
];

export const collegeAnalytics = [
  { college: "Symbiosis Pune", applicants: 96, selectionRate: 18, perfAfterHire: 88 },
  { college: "Christ University", applicants: 84, selectionRate: 15, perfAfterHire: 85 },
  { college: "NMIMS Mumbai", applicants: 78, selectionRate: 14, perfAfterHire: 83 },
  { college: "MICA Ahmedabad", applicants: 61, selectionRate: 22, perfAfterHire: 90 },
  { college: "IIM Bangalore", applicants: 47, selectionRate: 26, perfAfterHire: 93 },
];

export const geoAnalytics = [
  { state: "Maharashtra", applicants: 342 },
  { state: "Karnataka", applicants: 268 },
  { state: "Delhi", applicants: 196 },
  { state: "Gujarat", applicants: 142 },
  { state: "Tamil Nadu", applicants: 121 },
  { state: "Uttar Pradesh", applicants: 98 },
  { state: "West Bengal", applicants: 77 },
];

export const departmentAnalytics = [
  { dept: "Marketing", headcount: 24, avgPerf: 89, retention: 92, openRoles: 6 },
  { dept: "Sales", headcount: 18, avgPerf: 82, retention: 84, openRoles: 8 },
  { dept: "HR", headcount: 11, avgPerf: 88, retention: 95, openRoles: 3 },
];

export const departmentRadar = [
  { metric: "Performance", Marketing: 89, Sales: 82, HR: 88 },
  { metric: "Retention", Marketing: 92, Sales: 84, HR: 95 },
  { metric: "Engagement", Marketing: 90, Sales: 80, HR: 91 },
  { metric: "Velocity", Marketing: 86, Sales: 88, HR: 79 },
  { metric: "Quality", Marketing: 91, Sales: 83, HR: 90 },
];

export const monthlyHiring = [
  { month: "Jan", applicants: 142, hires: 11 },
  { month: "Feb", applicants: 168, hires: 13 },
  { month: "Mar", applicants: 201, hires: 16 },
  { month: "Apr", applicants: 234, hires: 19 },
  { month: "May", applicants: 268, hires: 22 },
  { month: "Jun", applicants: 271, hires: 24 },
];

/* ---------------- Dashboard overview ---------------- */
export const overviewKpis = [
  { label: "Total Applicants", value: 1284, delta: "+13.7%", trend: "up" as const, spark: [142, 168, 154, 196, 184, 221] },
  { label: "Active Interns", value: 94, delta: "+8.2%", trend: "up" as const, spark: [61, 68, 72, 80, 88, 94] },
  { label: "Avg Performance", value: 88, suffix: "%", delta: "+2.4%", trend: "up" as const, spark: [82, 83, 85, 86, 87, 88] },
  { label: "Certificates Issued", value: 142, delta: "+19%", trend: "up" as const, spark: [80, 96, 104, 120, 131, 142] },
];

export const activityFeed = [
  { id: "f1", icon: "sparkles", text: "AI scored Aarav Sharma at 92 fit", meta: "2 min ago", tone: "blue" },
  { id: "f2", icon: "user-check", text: "Diya Patel moved to Selected", meta: "18 min ago", tone: "green" },
  { id: "f3", icon: "calendar", text: "Interview scheduled with Ishita Reddy", meta: "41 min ago", tone: "sky" },
  { id: "f4", icon: "award", text: "Completion certificate issued to Ananya Iyer", meta: "1 hr ago", tone: "blue" },
  { id: "f5", icon: "file-text", text: "12 new resumes parsed by AI engine", meta: "2 hr ago", tone: "navy" },
];
