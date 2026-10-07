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

/**
 * A job as the public site sees it. Every field comes from the database;
 * a value the employer did not give is null, never a made-up default.
 */
export type PublicJobOpening = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  /** Salary text exactly as entered for the company, e.g. "15000-18000". */
  salary: string | null;
  /** Experience note entered for the company, e.g. "Freshers welcome". */
  experience: string | null;
  description: string | null;
  skills: string[];
  /** Number of vacancies, when the company gave one. */
  openings: number | null;
  /** ISO date the role was created, if known. */
  postedAt: string | null;
};

export type PublicApplication = {
  jobId: string;
  appliedAt: string;
  status: PublicApplicationStatus;
  /** The candidate's exact CRM pipeline stage, e.g. "interview_over". */
  stage: string | null;
  resumeName: string;
};

/**
 * CRM pipeline (my-job-solutions-crm, lib/crm/constants.ts):
 *   new_lead → got_the_fees → job_matched → interview_over → placed
 *   → review_3_days → review_7_days → review_15_days, or rejected.
 * The review stages are check-ins after the candidate has joined.
 */
export function mapCandidateStatusToPublicStatus(
  status: string | null | undefined,
): PublicApplicationStatus {
  switch (status) {
    case "placed":
    case "review_3_days":
    case "review_7_days":
    case "review_15_days":
      return "Selected";
    case "rejected":
      return "Rejected";
    case "job_matched":
    case "interview_over":
      return "Interview";
    default:
      return "Submitted";
  }
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
  const orNull = (value: unknown) => textValue(value).trim() || null;

  return {
    id: textValue(role.id),
    title: textValue(role.title).trim(),
    company: orNull(company.name),
    location: orNull(role.location) ?? orNull(company.location),
    salary: orNull(company.salary),
    experience: orNull(company.fresher_experience),
    description: orNull(role.description),
    skills: stringArray(role.required_skills),
    openings: numberValue(role.vacancy_count),
    postedAt: orNull(role.created_at),
  };
}
