export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt?: string;
}

/** Demo-only seed (shown when Supabase isn't configured). Real orgs start clean. */
export const ANNOUNCEMENT_SEED: Announcement[] = [
  {
    id: "a1",
    title: "Q3 kickoff 🚀",
    body: "Welcome to Q3! This quarter we're doubling down on growth experiments and brand. Huge thanks for the momentum - let's make it our best one yet.",
    authorId: "m1",
    authorName: "M. Joshi",
    createdAt: "Today",
  },
];
