"use client";

import Link from "next/link";
import { useState } from "react";

import { useDict, useLang } from "@/components/i18n-provider";
import { CompanyMark } from "@/components/jobs/job-row";
import { AnchorButton, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { formatSalary } from "@/lib/job-utils";
import type { PublicApplicationStatus } from "@/lib/public-api";
import { SITE, whatsappLink } from "@/lib/site";
import { useSite } from "./site-provider";

type Status = PublicApplicationStatus;
type Tab = "all" | "active" | "selected" | "closed";

const STAGES = ["Submitted", "Interview", "Selected"] as const;

const TAB_MATCH: Record<Tab, (s: Status) => boolean> = {
  all: () => true,
  active: (s) => s === "Submitted" || s === "Interview",
  selected: (s) => s === "Selected",
  closed: (s) => s === "Rejected",
};

// One look per status, from the three site colours (green, navy, red).
const LOOK: Record<Status, { stripe: string; pill: string; box: string; Icon: typeof CheckIcon }> = {
  Submitted: { stripe: "bg-line-strong", pill: "bg-navy-soft text-ink-soft", box: "bg-navy-soft/70", Icon: ClockIcon },
  Interview: { stripe: "bg-ink", pill: "bg-ink text-white", box: "bg-navy-soft", Icon: CalendarIcon },
  Selected: { stripe: "bg-accent", pill: "bg-accent text-white", box: "bg-accent-wash", Icon: CheckIcon },
  Rejected: { stripe: "bg-signal/70", pill: "bg-signal-soft text-signal", box: "bg-paper-sunk/70", Icon: CloseIcon },
};

export function ApplicationsList() {
  const t = useDict();
  const lang = useLang();
  const { authLoaded, isSignedIn, profileLoaded, applications, applicationJobs } = useSite();
  const [tab, setTab] = useState<Tab>("all");

  if (!authLoaded || (isSignedIn && !profileLoaded)) {
    return (
      <div className="space-y-3" aria-busy>
        <div className="h-24 animate-pulse rounded-2xl bg-paper-sunk" />
        {[0, 1].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-paper-sunk" />)}
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

  const count = (s: Status) => applications.filter((a) => a.status === s).length;
  const tabCount = (k: Tab) => applications.filter((a) => TAB_MATCH[k](a.status)).length;
  const visible = applications.filter((a) => TAB_MATCH[tab](a.status));
  const dateFmt = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });

  const tiles = [
    { label: t.applied.summary.total, value: applications.length, tone: "text-ink" },
    { label: t.applied.summary.review, value: count("Submitted"), tone: "text-ink" },
    { label: t.applied.summary.interview, value: count("Interview"), tone: "text-ink" },
    { label: t.applied.summary.selected, value: count("Selected"), tone: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-line bg-surface px-4 py-3.5">
            <dt className="text-[13px] text-ink-mute">{tile.label}</dt>
            <dd className={`num mt-0.5 font-display text-3xl ${tile.tone}`}>{tile.value}</dd>
          </div>
        ))}
      </dl>

      {/* Filter tabs */}
      <div role="tablist" aria-label={t.applied.title} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(Object.keys(TAB_MATCH) as Tab[]).map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink-soft hover:border-accent/50"
              }`}
            >
              {t.applied.tabs[key]}
              <span className={`num rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-navy-soft text-ink-mute"}`}>{tabCount(key)}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center text-ink-mute">{t.applied.tabEmpty}</p>
      ) : (
        <ul className="space-y-4">
          {visible.map((app) => {
            const job = applicationJobs.find((j) => j.id === app.jobId);
            const look = LOOK[app.status];
            const salary = job ? formatSalary(job) : null;
            const applied = new Date(app.appliedAt);
            const title = job?.title ?? t.applied.removedJob;

            return (
              <li key={app.jobId} className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_16px_32px_-28px_rgba(13,63,18,0.45)]">
                <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${look.stripe}`} />
                <div className="p-5 pl-6 sm:p-6 sm:pl-8">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <CompanyMark name={job?.company ?? null} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                        {job ? (
                          <Link href={`/jobs/${job.id}`} className="font-display text-xl leading-snug break-words hover:text-accent">{job.title}</Link>
                        ) : (
                          <p className="font-display text-xl text-ink-mute">{t.applied.removedJob}</p>
                        )}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${look.pill}`}>
                          <look.Icon size={14} />
                          {t.applied.stages[app.status]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-ink-mute">{[job?.company, job?.location, salary].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>

                  {/* Tracker */}
                  <Tracker status={app.status} labels={t.applied.stages} />

                  {/* What's next */}
                  <div className={`mt-5 rounded-xl px-4 py-3.5 ${look.box}`}>
                    <p className="text-xs font-bold tracking-[0.06em] text-ink-mute uppercase">{t.applied.nextTitle}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink">{t.applied.next[app.status]}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {app.status === "Submitted" && (
                        <AnchorButton href={whatsappLink(t.applied.waUpdate(title))} target="_blank" rel="noreferrer" variant="whatsapp" size="sm">
                          <WhatsAppIcon size={16} /> {t.applied.actions.askUpdate}
                        </AnchorButton>
                      )}
                      {app.status === "Interview" && (
                        <>
                          <LinkButton href="/#ready" size="sm"><CheckIcon size={15} /> {t.applied.actions.checklist}</LinkButton>
                          <AnchorButton href={whatsappLink(t.applied.waUpdate(title))} target="_blank" rel="noreferrer" variant="whatsapp" size="sm">
                            <WhatsAppIcon size={16} /> {t.applied.actions.askUpdate}
                          </AnchorButton>
                        </>
                      )}
                      {app.status === "Selected" && (
                        <AnchorButton href={SITE.phoneHref} size="sm"><PhoneIcon size={15} /> {t.applied.actions.callOffice}</AnchorButton>
                      )}
                      {app.status === "Rejected" && (
                        <LinkButton href="/jobs" variant="secondary" size="sm">{t.applied.actions.similar} <ArrowRightIcon size={15} /></LinkButton>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between gap-4 text-sm text-ink-mute">
                    {!Number.isNaN(applied.getTime()) ? (
                      <span className="num inline-flex items-center gap-1.5"><ClockIcon size={14} /> {t.applied.appliedOn} {dateFmt.format(applied)}</span>
                    ) : <span />}
                    {job && (
                      <Link href={`/jobs/${job.id}`} className="group inline-flex items-center gap-1 font-semibold text-accent">
                        {t.applied.viewJob} <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Help */}
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-accent/20 bg-accent-wash p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-display text-lg">{t.applied.helpTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t.applied.helpBody}</p>
        </div>
        <AnchorButton href={whatsappLink()} target="_blank" rel="noreferrer" className="shrink-0">
          <WhatsAppIcon size={18} /> {t.common.whatsapp}
        </AnchorButton>
      </div>
    </div>
  );
}

/** Applied → Interview → Selected, with a red cross where a rejection happened. */
function Tracker({ status, labels }: { status: Status; labels: Record<Status, string> }) {
  const rejected = status === "Rejected";
  // How far the application got. A rejection is shown on the step after "Submitted".
  const reached = status === "Selected" ? 2 : status === "Interview" ? 1 : 0;
  const failedAt = rejected ? 1 : -1;

  return (
    <ol className="mt-6 grid grid-cols-3" aria-label={labels[status]}>
      {STAGES.map((stage, i) => {
        const done = i <= reached && i !== failedAt;
        const failed = i === failedAt;
        const current = !rejected && i === reached && status !== "Selected";
        const lineDone = i < reached && !rejected;
        return (
          <li key={stage} className="relative flex flex-col items-center text-center">
            {i < STAGES.length - 1 && (
              <span aria-hidden className={`absolute top-4 left-1/2 h-0.5 w-full ${lineDone ? "bg-accent" : "bg-line"}`} />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                failed
                  ? "border-signal bg-signal text-white"
                  : done
                    ? current
                      ? "border-accent bg-surface text-accent ring-4 ring-accent-soft"
                      : "border-accent bg-accent text-white"
                    : "border-line-strong bg-surface text-ink-mute"
              }`}
            >
              {failed ? <CloseIcon size={14} /> : done && !current ? <CheckIcon size={15} /> : <span className={`h-2 w-2 rounded-full ${done ? "bg-accent" : "bg-line-strong"}`} />}
            </span>
            <span className={`mt-2 text-xs font-semibold sm:text-[13px] ${failed ? "text-signal" : done ? "text-ink" : "text-ink-mute"}`}>
              {failed ? labels.Rejected : labels[stage]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
