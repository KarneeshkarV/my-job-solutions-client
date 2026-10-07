"use client";

import Link from "next/link";

import { useDict, useLang } from "@/components/i18n-provider";
import { useSite } from "@/components/site/site-provider";
import { CheckIcon, ClockIcon, PinIcon, UsersIcon } from "@/components/ui/icons";
import { daysSincePosted, formatSalary, isFresherFriendly, postedLabel, type Job } from "@/lib/job-utils";
import { CompanyMark } from "./job-row";

/** A job as a card, for grids on the home page. */
export function JobCard({ job }: { job: Job }) {
  const t = useDict();
  const lang = useLang();
  const { hasApplied } = useSite();
  const salary = formatSalary(job);
  const days = daysSincePosted(job);
  const applied = hasApplied(job.id);

  return (
    <li>
      <Link
        href={`/jobs/${job.id}`}
        className="group flex h-full flex-col gap-3.5 rounded-2xl border border-line bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_20px_40px_-26px_rgba(13,63,18,0.5)]"
      >
        <div className="flex items-center gap-3">
          <CompanyMark name={job.company} />
          <div className="min-w-0">
            <h3 className="font-display text-lg leading-tight break-words group-hover:text-accent-ink">{job.title}</h3>
            <p className="truncate text-sm text-ink-mute">{job.company ?? t.common.companyHidden}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] text-ink-mute">
          {job.location && <span className="inline-flex items-center gap-1"><PinIcon size={14} /> {job.location}</span>}
          {job.openings ? <span className="inline-flex items-center gap-1"><UsersIcon size={14} /> {t.common.openings(job.openings)}</span> : null}
          {days !== null && <span className="inline-flex items-center gap-1"><ClockIcon size={14} /> {postedLabel(days, lang)}</span>}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {days !== null && days <= 3 && (
            <span className="rounded-full bg-signal-soft px-2.5 py-0.5 text-xs font-semibold text-signal uppercase">{t.common.isNew}</span>
          )}
          {isFresherFriendly(job) && (
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-hover">{t.jobs.freshers}</span>
          )}
          {job.skills.slice(0, 3).length > 0 && (
            <span className="rounded-full bg-navy-soft px-2.5 py-0.5 text-xs font-medium text-ink-soft">{job.skills.slice(0, 3).join(" · ")}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-line pt-3.5">
          <span className="num font-semibold">{salary ?? <span className="text-sm font-normal text-ink-mute">{t.common.notDisclosed}</span>}</span>
          {applied ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-accent-soft px-3 py-1.5 text-[13px] font-semibold text-accent-hover">
              <CheckIcon size={14} /> {t.common.applied}
            </span>
          ) : (
            <span className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-semibold text-white">{t.common.apply}</span>
          )}
        </div>
      </Link>
    </li>
  );
}
