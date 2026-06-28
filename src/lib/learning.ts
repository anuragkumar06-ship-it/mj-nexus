export type LearningType = "Video" | "Article" | "Course" | "Doc";
export type LearningLevel = "Beginner" | "Intermediate" | "Advanced";

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: LearningType;
  url: string;
  category: string;
  folder?: string;
  level: LearningLevel;
  createdAt?: string;
}

/** Demo-only seed (shown when Supabase isn't configured). Real orgs start clean. */
export const LEARNING_SEED: LearningResource[] = [
  {
    id: "lr1",
    title: "Digital Marketing Fundamentals",
    description: "SEO, SEM and content marketing core concepts every intern should know.",
    type: "Course",
    url: "https://www.youtube.com/results?search_query=digital+marketing+fundamentals",
    category: "Marketing",
    folder: "Marketing Foundations",
    level: "Beginner",
  },
  {
    id: "lr2",
    title: "Mastering LinkedIn Outreach",
    description: "Proven outreach templates and a repeatable pipeline-building workflow.",
    type: "Video",
    url: "https://www.youtube.com/results?search_query=linkedin+outreach+strategy",
    category: "Sales",
    level: "Intermediate",
  },
  {
    id: "lr3",
    title: "Brand Storytelling Essentials",
    description: "Craft a narrative that makes a brand memorable and trusted.",
    type: "Article",
    url: "https://www.youtube.com/results?search_query=brand+storytelling",
    category: "Branding",
    level: "Beginner",
  },
  {
    id: "lr4",
    title: "Analytics with GA4",
    description: "Set up events, funnels and dashboards to measure what matters.",
    type: "Course",
    url: "https://www.youtube.com/results?search_query=google+analytics+4+tutorial",
    category: "Tools",
    level: "Intermediate",
  },
  {
    id: "lr5",
    title: "Recruiting & Talent Screening",
    description: "Structured interviews and fair, fast candidate screening.",
    type: "Video",
    url: "https://www.youtube.com/results?search_query=recruiting+talent+screening",
    category: "HR",
    level: "Beginner",
  },
  {
    id: "lr6",
    title: "Advanced Content Strategy",
    description: "Editorial calendars, distribution and repurposing at scale.",
    type: "Doc",
    url: "https://www.youtube.com/results?search_query=content+strategy",
    category: "Marketing",
    folder: "Marketing Foundations",
    level: "Advanced",
  },
];
