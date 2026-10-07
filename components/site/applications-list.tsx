"use client";

import Link from "next/link";

import { useDict, useLang } from "@/components/i18n-provider";
import { CompanyMark } from "@/components/jobs/job-row";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckIcon } from "@/components/ui/icons";
import { formatSalary } from "@/lib/job-utils";
import type { PublicApplicationStatus } from "@/lib/public-api";
import { useSite } from "./site-provider";

const STAGES = ["Submitted", "Interview", "Selected"] as const;

function stageIndex(status: PublicApplicationStatus) {
  if (status === "Selected") return 2;
  if (status === "Interview") return 1;
  return 0;
}

function StatusPill({ status, label }: { status: PublicApplicationStatus; label: string }) {
  const styles: Record<PublicApplicationStatus, string> = {
    Submitted: "bg-paper-sunk text-ink-soft",
    Interview: "bg-navy-soft text-ink",
    Selected: "bg-accent text-white",
    Rejected: "bg-signal-soft text-signal",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>{label}</span>;
}

export function ApplicationsList() {
  const t = useDict();
  const lang = useLang();
  const { authLoaded, isSignedIn, profileLoaded, applications, applicationJobs } = useSite();

  if (!authLoaded || (isSignedIn && !profileLoaded)) {
    return (
      <div className="space-y-3" aria-busy>
        {[0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-paper-sunk" />)}
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <EmptyState title={t.applied.signedOutTitle} body={t.applied.signedOutBody}>
        <LinkButton href="/sign-in?redirect_url=/applied">{t.nav.signIn}</LinkButton>
        <LinkButton href="/sign-up" variant="secondary">{t.nav.register}</LinkButton>
      </EmptyState>
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState title={t.applied.emptyTitle} body={t.applied.emptyBody}>
        <LinkButton href="/jobs">{t.common.viewAll}</LinkButton>
      </EmptyState>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <ul className="space-y-4">
      {applications.map((app) => {
        const job = applicationJobs.find((j) => j.id === app.jobId);
        const current = stageIndex(app.status);
        const rejected = app.status === "Rejected";
        const salary = job ? formatSalary(job) : null;
        const applied = new Date(app.appliedAt);

        return (
          <li key={app.jobId} className="rounded-xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <CompanyMark name={job?.company ?? null} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  {job ? (
                    <Link href={`/jobs/${job.id}`} className="font-display text-xl leading-snug hover:text-accent">{job.title}</Link>
                  ) : (
                    <p className="font-display text-xl text-ink-mute">{t.applied.removedJob}</p>
                  )}
                  <StatusPill status={app.status} label={t.applied.stages[app.status]} />
                </div>
                <p className="mt-0.5 text-sm text-ink-mute">
                  {[job?.company, job?.location, salary].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            {/* Progress */}
            <ol className="mt-6 grid grid-cols-3 gap-2" aria-label={t.applied.stages[app.status]}>
              {STAGES.map((stage, i) => {
                const done = !rejected && i <= current;
                const isLast = rejected && i === current + 1;
                return (
                  <li key={stage} className="flex flex-col gap-2">
                    <span className={`h-1 rounded-full ${done ? "bg-accent" : isLast ? "bg-signal/60" : "bg-line"}`} />
                    <span className={`flex items-center gap-1 text-xs ${done ? "text-ink" : "text-ink-mute"}`}>
                      {done && <CheckIcon size={12} className="text-accent" />}
                      {isLast ? t.applied.stages.Rejected : t.applied.stages[stage]}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-5 flex flex-col gap-1 border-t border-line pt-4 text-sm sm:flex-row sm:justify-between sm:gap-6">
              <p className="text-ink-soft">{t.applied.statusNote[app.status]}</p>
              {!Number.isNaN(applied.getTime()) && (
                <p className="num shrink-0 text-ink-mute">{t.applied.appliedOn} {dateFmt.format(applied)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
