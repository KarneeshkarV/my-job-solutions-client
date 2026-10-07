import type { PublicJobOpening } from "@/lib/public-api";

export type Job = PublicJobOpening;

const NOT_DISCLOSED = "Not disclosed";

function salaryNumbers(salary: string): number[] {
  return (salary.match(/\d[\d,]*/g) ?? [])
    .map((part) => Number(part.replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function hasSalary(job: Job): boolean {
  return job.salary !== NOT_DISCLOSED && salaryNumbers(job.salary).length > 0;
}

/** "15000-18000" → "₹15,000 – 18,000". Free text without numbers is returned as is. */
export function formatSalary(job: Job): string | null {
  if (job.salary === NOT_DISCLOSED) return null;
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
  return /fresher|no experience|\b0\s*[-–]/i.test(job.experience);
}

/** Two-letter monogram for a company, used where a logo would go. */
export function monogram(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "MJ";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
