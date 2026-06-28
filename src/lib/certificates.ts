export type CertType = "Completion" | "Letter of Recommendation" | "Appreciation" | "Experience" | "Offer";
export type CertStatus = "Requested" | "Issued";

export const CERT_TYPES: CertType[] = ["Completion", "Letter of Recommendation", "Appreciation", "Experience", "Offer"];

export interface Certificate {
  id: string;
  recipientId: string;
  recipientName: string;
  type: CertType;
  title: string;
  message: string;
  issuedBy: string;
  issuedByName: string;
  status: CertStatus;
  createdAt?: string;
  fileUrl?: string;
  fileName?: string;
}

export function certTitle(type: CertType): string {
  switch (type) {
    case "Completion":
      return "Certificate of Completion";
    case "Letter of Recommendation":
      return "Letter of Recommendation";
    case "Appreciation":
      return "Certificate of Appreciation";
    case "Experience":
      return "Experience Certificate";
    case "Offer":
      return "Internship Offer Letter";
  }
}

/** True for text-style documents (letters) vs. visual certificates. */
export function isLetter(type: CertType): boolean {
  return type === "Letter of Recommendation" || type === "Offer";
}

export function defaultMessage(name: string, type: CertType, opts?: { role?: string; team?: string }): string {
  const first = name.split(" ")[0] || name;
  const role = opts?.role ? `${opts.role} ` : "";
  const team = opts?.team ? ` on the ${opts.team} team` : "";
  switch (type) {
    case "Completion":
      return `This is to certify that ${name} has successfully completed the ${role}Internship Program at Nexus Talent OS${team}, demonstrating dedication, professionalism and strong results throughout the program.`;
    case "Appreciation":
      return `In recognition of ${name}'s outstanding contribution and commitment${team} at Nexus Talent OS. ${first}'s energy, ownership and impact have been truly valued by the entire team.`;
    case "Letter of Recommendation":
      return `To whom it may concern,\n\nI am pleased to recommend ${name}, who worked as a ${role}intern at Nexus Talent OS${team}. ${first} consistently delivered high-quality work, collaborated effectively, and showed remarkable growth. I recommend ${first} without reservation for any future opportunity.`;
    case "Experience":
      return `This is to certify that ${name} served as a ${role}intern at Nexus Talent OS${team}. During this tenure, ${first} gained hands-on experience and contributed meaningfully to live projects with professionalism and commitment.`;
    case "Offer":
      return `Dear ${first},\n\nWe are delighted to offer you the position of ${role}Intern at Nexus Talent OS${team}. We were impressed by your skills and enthusiasm, and we look forward to welcoming you to the team.`;
  }
}

/** Demo-only seed (shown when Supabase isn't configured). Real orgs start clean. */
export const CERTIFICATE_SEED: Certificate[] = [
  {
    id: "cert1",
    recipientId: "i1",
    recipientName: "Aarav Sharma",
    type: "Completion",
    title: certTitle("Completion"),
    message: defaultMessage("Aarav Sharma", "Completion", { role: "Marketing", team: "Growth" }),
    issuedBy: "m1",
    issuedByName: "M. Joshi",
    status: "Issued",
    createdAt: "2026-06-20",
  },
  {
    id: "cert2",
    recipientId: "i5",
    recipientName: "Rohan Mehta",
    type: "Letter of Recommendation",
    title: certTitle("Letter of Recommendation"),
    message: defaultMessage("Rohan Mehta", "Letter of Recommendation", { role: "Sales", team: "Revenue" }),
    issuedBy: "l3",
    issuedByName: "Team Lead",
    status: "Requested",
    createdAt: "Today",
  },
];
