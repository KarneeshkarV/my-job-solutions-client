import type { Metadata } from "next";
import Link from "next/link";

import { ApplyPanel } from "@/components/jobs/apply-panel";
import { CompanyMark, JobRow } from "@/components/jobs/job-row";
import { LinkButton } from "@/components/ui/button";
import { ArrowLeftIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getDict, getLang } from "@/lib/i18n-server";
import { daysSincePosted, formatSalary, postedLabel } from "@/lib/job-utils";
import { getOpenJob, getOpenJobs } from "@/lib/jobs";
import { SITE, whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const job = await getOpenJob(id);
  if (!job) return { title: "Job not found" };
  const salary = formatSalary(job);
  return {
    title: [job.title, job.company].filter(Boolean).join(" — "),
    description: [job.location, salary, job.experience].filter(Boolean).join(" · ") || undefined,
  };
}

export default async function JobPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  const [t, lang, job] = await Promise.all([getDict(), getLang(), getOpenJob(id)]);

  if (!job) {
    return (
      <div className="wrap py-24">
        <h1 className="font-display text-4xl">{t.job.notFound}</h1>
        <p className="mt-3 text-lg text-ink-soft">{t.job.notFoundBody}</p>
        <LinkButton href="/jobs" className="mt-8">{t.common.viewAll}</LinkButton>
      </div>
    );
  }

  const related = (await getOpenJobs())
    .filter((j) => j.id !== job.id && job.location !== null && j.location === job.location)
    .slice(0, 3);

  const salary = formatSalary(job);
  const days = daysSincePosted(job);
  // Only facts the database actually has. Salary is always listed so
  // candidates know to ask for it.
  const facts = [
    { label: t.job.salary, value: salary ?? t.common.notDisclosed },
    ...(job.experience ? [{ label: t.job.experience, value: job.experience }] : []),
    ...(job.openings ? [{ label: t.job.openings, value: String(job.openings) }] : []),
    ...(days !== null ? [{ label: t.job.posted, value: postedLabel(days, lang) }] : []),
  ];

  const shareHref = whatsappLink(`${t.job.shareText(job.title, job.company ?? "")}\n`);

  return (
    <article className="pb-28 md:pb-24">
      <div className="wrap pt-8">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-ink-mute hover:text-ink">
          <ArrowLeftIcon size={16} /> {t.job.allJobs}
        </Link>
      </div>

      <header className="wrap animate-rise flex flex-col gap-5 pt-8 pb-10 sm:flex-row sm:items-start">
        <CompanyMark name={job.company} size="lg" />
        <div>
          <h1 className="font-display text-[2rem] leading-[1.1] tracking-tight text-balance break-words sm:text-4xl md:text-5xl">{job.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-lg text-ink-soft">
            <span className={job.company ? "" : "text-ink-mute"}>{job.company ?? t.common.companyHidden}</span>
            <span aria-hidden className="hidden text-line-strong sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5">
              <PinIcon size={16} className="text-ink-mute" /> {job.location ?? t.common.locationHidden}
            </span>
          </p>
        </div>
      </header>

      <div className="wrap grid gap-12 border-t border-line pt-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="eyebrow">{t.job.about}</h2>
            <p className="mt-3 text-[17px] leading-relaxed break-words whitespace-pre-line text-ink-soft">
              {job.description ?? t.job.noDescription}
            </p>
          </section>

          {job.skills.length > 0 && (
            <section>
              <h2 className="eyebrow">{t.job.skills}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <li key={skill} className="rounded-full border border-line-strong bg-surface px-3 py-1 text-sm text-ink-soft">{skill}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {facts.map((fact) => (
              <div key={fact.label} className="flex justify-between gap-4 px-5 py-3.5 text-[15px] first:bg-accent-wash first:font-semibold">
                <dt className="text-ink-mute">{fact.label}</dt>
                <dd className="num text-right text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 hidden md:block">
            <ApplyPanel job={job} />
          </div>

          <div className="mt-6 space-y-3 border-t border-line pt-5 text-[15px]">
            <a href={shareHref} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-ink-soft hover:text-ink">
              <WhatsAppIcon className="text-[#1faa53]" /> <span className="link">{t.job.share}</span>
            </a>
            <a href={SITE.phoneHref} className="flex items-center gap-2.5 text-ink-soft hover:text-ink">
              <PhoneIcon className="text-ink-mute" />
              <span>{t.job.byPhone} <span className="link num whitespace-nowrap">{SITE.phoneDisplay}</span></span>
            </a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="wrap mt-20">
          <h2 className="font-display text-2xl">{t.job.related}</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {related.map((r) => <JobRow key={r.id} job={r} />)}
          </ul>
        </section>
      )}

      {/* Mobile: apply stays in reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur-md md:hidden">
        <ApplyPanel job={job} compact />
      </div>
    </article>
  );
}
