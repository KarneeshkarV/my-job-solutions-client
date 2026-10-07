import type { Metadata } from "next";
import Link from "next/link";

import { ApplyPanel } from "@/components/jobs/apply-panel";
import { CompanyMark, JobRow } from "@/components/jobs/job-row";
import { LinkButton } from "@/components/ui/button";
import { ArrowLeftIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getDict } from "@/lib/i18n-server";
import { formatSalary } from "@/lib/job-utils";
import { getOpenJob, getOpenJobs } from "@/lib/jobs";
import { SITE, whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const job = await getOpenJob(id);
  if (!job) return { title: "Job not found" };
  const salary = formatSalary(job);
  return {
    title: `${job.title} — ${job.company}`,
    description: [job.location, salary && `${salary} / month`, job.experience].filter(Boolean).join(" · "),
  };
}

export default async function JobPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  const [t, job] = await Promise.all([getDict(), getOpenJob(id)]);

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
    .filter((j) => j.id !== job.id && j.location === job.location)
    .slice(0, 3);

  // The data mapping repeats the description as the first responsibility.
  const responsibilities = job.responsibilities.filter((r) => r !== job.description);
  const salary = formatSalary(job);
  const facts = [
    { label: t.job.salary, value: salary ? `${salary} ${job.salaryLabel ? t.common.perMonth : ""}` : t.common.notDisclosed },
    { label: t.job.experience, value: job.experience },
    { label: t.job.qualification, value: job.qualification },
    { label: t.job.joining, value: job.joining },
    { label: t.job.type, value: job.jobType },
  ];

  const shareHref = whatsappLink(`${t.job.shareText(job.title, job.company)}\n`);

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
          <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl">{job.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-lg text-ink-soft">
            <span>{job.company}</span>
            <span aria-hidden className="text-line-strong">·</span>
            <span className="inline-flex items-center gap-1.5"><PinIcon size={16} className="text-ink-mute" /> {job.location}</span>
          </p>
        </div>
      </header>

      <div className="wrap grid gap-12 border-t border-line pt-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="eyebrow">{t.job.about}</h2>
            <p className="mt-3 text-[17px] leading-relaxed whitespace-pre-line text-ink-soft">{job.description}</p>
          </section>

          {responsibilities.length > 0 && (
            <section>
              <h2 className="eyebrow">{t.job.responsibilities}</h2>
              <ul className="mt-3 space-y-2.5">
                {responsibilities.map((item) => (
                  <li key={item} className="flex gap-3 text-[17px] leading-relaxed text-ink-soft">
                    <span className="mt-[0.7em] h-1 w-3 shrink-0 rounded-full bg-accent/60" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.requirements.length > 0 && (
            <section>
              <h2 className="eyebrow">{t.job.requirements}</h2>
              <ul className="mt-3 space-y-2.5">
                {job.requirements.map((item) => (
                  <li key={item} className="flex gap-3 text-[17px] leading-relaxed text-ink-soft">
                    <span className="mt-[0.7em] h-1 w-3 shrink-0 rounded-full bg-accent/60" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

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

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <dl className="divide-y divide-line rounded-xl border border-line bg-surface">
            {facts.map((fact) => (
              <div key={fact.label} className="flex justify-between gap-4 px-5 py-3.5 text-[15px]">
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
              <WhatsAppIcon className="text-[#1f7a4d]" /> <span className="link">{t.job.share}</span>
            </a>
            <a href={SITE.phoneHref} className="flex items-center gap-2.5 text-ink-soft hover:text-ink">
              <PhoneIcon className="text-ink-mute" />
              <span>{t.job.byPhone} <span className="link num">{SITE.phoneDisplay}</span></span>
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
