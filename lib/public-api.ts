export type PublicApplicationStatus =
  | "Submitted"
  | "Interview"
  | "Rejected"
  | "Selected";

export type PublicUserProfile = {
  name: string;
  fatherName: string;
  mobile: string;
  altMobile?: string;
  address: string;
  district: string;
  aadhaarLast4: string;
  qualification: string;
  experience: string;
  skills: string;
  interestedJob: string;
  resumeName: string;
};

export type PublicJobOpening = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  salaryLabel: string;
  jobType: string;
  experience: string;
  qualification: string;
  joining: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  badge?: "featured" | "new" | "urgent" | "open";
  /** Number of vacancies, when the company gave one. */
  openings: number | null;
  /** ISO date the role was created, if known. */
  postedAt: string | null;
};

export type PublicApplication = {
  jobId: string;
  appliedAt: string;
  status: PublicApplicationStatus;
  resumeName: string;
};

export function mapCandidateStatusToPublicStatus(
  status: string | null | undefined,
): PublicApplicationStatus {
  if (status === "placed") {
    return "Selected";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  if (
    status === "interview_over" ||
    status === "review_3_days" ||
    status === "review_7_days" ||
    status === "review_15_days"
  ) {
    return "Interview";
  }

  return "Submitted";
}

export function parseSkills(value: string): string[] {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function parseExperienceYears(value: string): number | null {
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

type DataRecord = Record<string, unknown>;

function textValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function toPublicProfile(
  candidate: DataRecord,
  resumeName = "",
): PublicUserProfile {
  const experienceYears = numberValue(candidate.experience_years);
  return {
    name: textValue(candidate.full_name),
    fatherName: textValue(candidate.father_name),
    mobile: textValue(candidate.phone),
    altMobile: textValue(candidate.alternate_phone),
    address: textValue(candidate.address),
    district: textValue(candidate.district) || textValue(candidate.location),
    aadhaarLast4: textValue(candidate.aadhaar_last4),
    qualification: textValue(candidate.highest_qualification),
    experience:
      textValue(candidate.employment_type) ||
      (experienceYears ? `${experienceYears} years` : ""),
    skills: stringArray(candidate.skills).join(", "),
    interestedJob: textValue(candidate.desired_role) || textValue(candidate.current_role),
    resumeName,
  };
}

export function roleToPublicJob(rawRole: unknown): PublicJobOpening {
  const role =
    Array.isArray(rawRole) && rawRole[0] && typeof rawRole[0] === "object"
      ? (rawRole[0] as DataRecord)
      : rawRole && typeof rawRole === "object"
        ? (rawRole as DataRecord)
        : {};
  const rawCompany = Array.isArray(role.companies)
    ? role.companies[0]
    : role.companies;
  const company = rawCompany && typeof rawCompany === "object"
    ? (rawCompany as DataRecord)
    : {};
  const companyName = textValue(company.name) || "MyJobSolution Partner";
  const location =
    textValue(role.location) ||
    textValue(company.location) ||
    "Location shared after screening";
  const salary = textValue(company.salary) || "Not disclosed";
  const experience =
    textValue(company.fresher_experience) || "Open to eligible candidates";
  const skills = stringArray(role.required_skills);
  const title = textValue(role.title) || "Open Role";
  const description = textValue(role.description);

  return {
    id: textValue(role.id),
    title,
    company: companyName,
    location,
    salary,
    salaryLabel: salary === "Not disclosed" ? "" : "per month",
    jobType: "Full time",
    experience,
    qualification: "As per role requirement",
    joining: "Immediate",
    description:
      description ||
      `Apply for ${title} at ${companyName}. Our team will verify your profile and share the next steps.`,
    responsibilities: [
      description || `Handle day-to-day responsibilities for ${title}.`,
      "Coordinate with the company team and follow reporting instructions.",
      "Maintain professional conduct during screening and onboarding.",
    ],
    requirements: [
      experience,
      skills.length ? `Skills: ${skills.join(", ")}` : "Relevant skills preferred.",
      "Valid contact details and updated resume required.",
    ],
    skills,
    badge: role.created_at ? "open" : "new",
    openings: numberValue(role.vacancy_count),
    postedAt: textValue(role.created_at) || null,
  };
}
