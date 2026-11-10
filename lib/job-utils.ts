import type { PublicJobOpening } from "@/lib/public-api";

export type Job = PublicJobOpening;

function salaryNumbers(salary: string | null): number[] {
  return (salary?.match(/\d[\d,]*/g) ?? [])
    .map((part) => Number(part.replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/**
 * Salary for display. Plain numbers ("15000-18000") get rupee formatting;
 * anything with words ("15k + PF per month") is shown exactly as entered.
 * Null when the company gave no salary.
 */
export function formatSalary(job: Job): string | null {
  if (!job.salary) return null;
  if (/[a-z\u0900-\u097f]/i.test(job.salary)) return job.salary;
  const nums = salaryNumbers(job.salary);
  if (nums.length === 0) return job.salary;
  const fmt = (n: number) => n.toLocaleString("en-IN");
  return nums.length >= 2 ? `₹${fmt(nums[0])} – ${fmt(nums[1])}` : `₹${fmt(nums[0])}`;
}

export function minSalary(job: Job): number {
  return salaryNumbers(job.salary)[0] ?? 0;
}

export function maxSalary(job: Job): number {
  const nums = salaryNumbers(job.salary);
  return nums[1] ?? nums[0] ?? 0;
}

export function isFresherFriendly(job: Job): boolean {
  return !!job.experience && /fresher|no experience|\b0\s*[-–]/i.test(job.experience);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole days since the job was posted, or null if unknown. */
export function daysSincePosted(job: Job, now = Date.now()): number | null {
  if (!job.postedAt) return null;
  const t = Date.parse(job.postedAt);
  return Number.isNaN(t) ? null : Math.max(0, Math.floor((now - t) / DAY));
}

/** "Today", "3 days ago", "2 weeks ago" in English or Hindi. */
export function postedLabel(days: number, lang: "en" | "hi"): string {
  const rtf = new Intl.RelativeTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { numeric: "auto" });
  if (days < 7) return rtf.format(-days, "day");
  if (days < 30) return rtf.format(-Math.floor(days / 7), "week");
  return rtf.format(-Math.floor(days / 30), "month");
}
