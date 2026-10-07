"use client";

import Link from "next/link";

import { useDict, useLang } from "@/components/i18n-provider";
import { ArrowRightIcon, CheckIcon, ClockIcon, PinIcon, UsersIcon } from "@/components/ui/icons";
import { daysSincePosted, formatSalary, isFresherFriendly, monogram, postedLabel, type Job } from "@/lib/job-utils";
import { useSite } from "@/components/site/site-provider";

export function CompanyMark({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-14 w-14 text-xl" : "h-11 w-11 text-[15px]";
  return (
    <span
      aria-hidden
      className={`${dims} flex shrink-0 items-center justify-center rounded-lg border border-accent/15 bg-accent-wash font-display text-accent-hover`}
    >
      {monogram(name)}
    </span>
  );
}

/** One job as a list row. The whole row links to the job page. */
export function JobRow({ job, compact = false }: { job: Job; compact?: boolean }) {
  const t = useDict();
  const lang = useLang();
  const { hasApplied } = useSite();
  const salary = formatSalary(job);
  const applied = hasApplied(job.id);
  const days = daysSincePosted(job);
  const isNew = days !== null && days <= 3;

  return (
    <li>
      <Link
        href={`/jobs/${job.id}`}
        className={`group grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2 px-1 transition-colors sm:rounded-lg sm:px-3 sm:hover:bg-surface ${compact ? "py-4" : "py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center"}`}
      >
        <CompanyMark name={job.company} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-display text-[1.15rem] leading-snug text-ink group-hover:text-accent-ink">{job.title}</h3>
            {isNew && (
              <span className="rounded-full bg-signal-soft px-2 py-0.5 text-[11px] font-medium tracking-wide text-signal uppercase">
                {t.common.isNew}
              </span>
            )}
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-mute">
            <span className="truncate text-ink-soft">{job.company}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <PinIcon size={14} />
              {job.location}
            </span>
          </p>
          {!compact && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-ink-mute">
            {isFresherFriendly(job) && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent-hover">{t.jobs.freshers}</span>
            )}
            {job.openings !== null && job.openings > 0 && (
              <span className="inline-flex items-center gap-1"><UsersIcon size={14} /> {t.common.openings(job.openings)}</span>
            )}
            {days !== null && (
              <span className="inline-flex items-center gap-1"><ClockIcon size={14} /> {postedLabel(days, lang)}</span>
            )}
            {applied && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-paper">
                <CheckIcon size={12} /> {t.common.applied}
              </span>
            )}
          </div>}
        </div>
        <div className={`col-start-2 flex items-center justify-between gap-4 ${compact ? "" : "sm:col-start-3 sm:justify-end"}`}>
          <p className={`num text-ink ${compact ? "" : "sm:text-right"}`}>
            {salary ? (
              <>
                <span className="text-base font-semibold">{salary}</span>
                {job.salaryLabel && <span className="ml-1 text-sm text-ink-mute">{t.common.perMonth}</span>}
              </>
            ) : (
              <span className="text-sm text-ink-mute">{t.common.notDisclosed}</span>
            )}
          </p>
          <ArrowRightIcon className="hidden shrink-0 text-ink-mute transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent sm:block" />
        </div>
      </Link>
    </li>
  );
}
