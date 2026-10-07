import Link from "next/link";
import { redirect } from "next/navigation";

import { JobCard } from "@/components/jobs/job-card";
import { CompanyMark } from "@/components/jobs/job-row";
import { AnchorButton, LinkButton } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CheckIcon,
  GradCapIcon,
  MonitorIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  StarIcon,
  WhatsAppIcon,
  WrenchIcon,
} from "@/components/ui/icons";
import type { Dict } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-server";
import { formatSalary, isFresherFriendly, type Job } from "@/lib/job-utils";
import { getOpenJobs } from "@/lib/jobs";
import { SITE, whatsappLink } from "@/lib/site";

// Old links used /?tab=<name>. Send them to the matching page.
const LEGACY_TABS: Record<string, string> = {
  jobs: "/jobs",
  applied: "/applied",
  about: "/about",
  contact: "/contact",
  register: "/profile",
  profile: "/profile",
};

// Where each "What have you studied?" card leads. Job data has no
// qualification field, so the first three search for the job names shown
// on the card (a comma means "any of these words").
const PATH_LINKS = [
  "/jobs?q=delivery,helper,sales,security,store",
  "/jobs?q=electrician,fitter,operator,technician,mechanic",
  "/jobs?q=account,computer,office,bank,data entry",
  "/jobs?exp=fresher",
];
const PATH_ICONS = [GradCapIcon, WrenchIcon, MonitorIcon, StarIcon];

// Student questions shown on the home page, picked from the About FAQ.
const HOME_FAQ = [0, 3, 1, 2];

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { tab } = await searchParams;
  if (typeof tab === "string" && LEGACY_TABS[tab]) {
    redirect(LEGACY_TABS[tab]);
  }

  const [t, jobs] = await Promise.all([getDict(), getOpenJobs()]);
  const latest = jobs.slice(0, 6);
  const towns = [...new Set(jobs.flatMap((j) => (j.location ? [j.location] : [])))].sort((a, b) => a.localeCompare(b));
  const h = t.home;

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden rounded-b-[28px] bg-[radial-gradient(60rem_30rem_at_85%_10%,#2f7a12_0%,transparent_60%),linear-gradient(160deg,#134f16_0%,var(--deep)_70%)] text-white md:rounded-b-[36px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1.2px,transparent_1.2px)] bg-[size:22px_22px] [mask-image:linear-gradient(90deg,transparent,#000_60%)]"
        />
        <div className="wrap relative grid items-center gap-10 pt-9 pb-20 md:pt-16 md:pb-24 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-lime/35 bg-brand-lime/15 px-3.5 py-1.5 text-sm font-semibold text-[#d9f5a8]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand-lime shadow-[0_0_0_4px_rgba(140,209,31,0.25)]" />
              {h.pill}
            </span>
            <h1 className="mt-5 font-display text-[2.6rem] leading-[1.1] font-extrabold sm:text-6xl sm:leading-[1.04] lg:text-[4rem]">
              {h.titleA}
              <span className="relative whitespace-nowrap text-brand-lime">
                {h.titleHighlight}
                <svg aria-hidden className="absolute inset-x-0 -bottom-1 h-2 w-full sm:-bottom-1.5 sm:h-3" viewBox="0 0 300 14" preserveAspectRatio="none">
                  <path d="M3 10C80 2 210 2 297 8" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              {h.titleB}
            </h1>
            <p className="mt-5 text-lg font-semibold text-[#cfeaa9] sm:text-[22px]">{h.titleAlt}</p>
            <p className="mt-2.5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{h.lede}</p>

            <form
              action="/jobs"
              role="search"
              className="mt-8 flex max-w-xl flex-col gap-1 rounded-2xl bg-white p-2.5 text-ink shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] sm:flex-row sm:items-center sm:gap-0 sm:p-2"
            >
              <label htmlFor="hero-q" className="sr-only">{h.searchPlaceholder}</label>
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-mute" />
                <input
                  id="hero-q"
                  name="q"
                  type="search"
                  placeholder={h.searchPlaceholder}
                  className="h-12 w-full rounded-lg bg-transparent pr-3 pl-11 text-base placeholder:text-ink-mute focus:outline-none"
                />
              </div>
              {towns.length > 1 && (
                <div className="relative border-t border-line sm:w-44 sm:border-t-0 sm:border-l">
                  <PinIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-mute" />
                  <label htmlFor="hero-loc" className="sr-only">{h.where}</label>
                  <select
                    id="hero-loc"
                    name="loc"
                    defaultValue=""
                    className="h-12 w-full cursor-pointer appearance-none bg-transparent pr-3 pl-11 text-base text-ink-soft focus:outline-none"
                  >
                    <option value="">{h.anywhere}</option>
                    {towns.map((town) => <option key={town} value={town}>{town}</option>)}
                  </select>
                </div>
              )}
              <button type="submit" className="mt-1 h-12 cursor-pointer rounded-xl bg-accent px-6 text-base font-semibold text-white transition-colors hover:bg-accent-hover sm:mt-0">
                {h.search}
              </button>
            </form>
          </div>

          <HeroArt jobs={jobs.slice(0, 2)} t={t} />
        </div>
      </section>

      {/* ───────── Trust strip ───────── */}
      <div className="wrap relative z-10 -mt-10">
        <ul className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_40px_-28px_rgba(13,63,18,0.4)] md:grid-cols-4">
          {h.trust.map((item, i) => (
            <li
              key={item.title}
              className={`flex items-center gap-2.5 p-3.5 md:gap-3.5 md:p-6 ${i % 2 === 1 ? "border-l border-line" : ""} ${i >= 2 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent md:h-12 md:w-12">
                {i === 0 ? <span className="font-bold">₹0</span> : i === 1 ? <ShieldCheckIcon size={22} /> : i === 2 ? <span lang="hi" className="text-xl font-bold">अ</span> : <PinIcon size={22} />}
              </span>
              <span>
                <b className="block text-sm leading-snug md:text-base">{item.title}</b>
                <span className="block text-[13px] leading-snug text-ink-mute md:text-sm">{item.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ───────── What have you studied ───────── */}
      <section className="wrap pt-16 md:pt-24">
        <SectionHead eyebrow={h.pathsEyebrow} title={h.pathsTitle} alt={h.pathsAlt} />
        <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {h.paths.map((path, i) => {
            const Icon = PATH_ICONS[i];
            const highlight = i === PATH_LINKS.length - 1;
            return (
              <li key={path.title}>
                <Link
                  href={PATH_LINKS[i]}
                  className={`group flex h-full flex-col rounded-2xl border p-4 transition-colors md:p-6 ${
                    highlight ? "border-accent/25 bg-accent-wash hover:border-accent" : "border-line bg-surface hover:border-accent"
                  }`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-accent ${highlight ? "bg-surface" : "bg-accent-soft"}`}>
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 font-display text-lg leading-tight md:text-[1.4rem]">{path.title}</h3>
                  <span className="text-sm text-ink-mute">{path.alt}</span>
                  <p className="mt-2 hidden text-sm leading-relaxed text-ink-soft md:block">{path.body}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent">
                    {path.cta} <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ───────── Latest jobs ───────── */}
      <section className="wrap pt-16 md:pt-24">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <SectionHead eyebrow={h.latestEyebrow} title={h.latest} />
          {latest.length > 0 && (
            <Link href="/jobs" className="group inline-flex items-center gap-1.5 font-semibold text-accent">
              {t.common.viewAll} <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        {latest.length > 0 ? (
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((job) => <JobCard key={job.id} job={job} />)}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
            <p className="mx-auto max-w-md text-ink-soft">{h.latestEmpty}</p>
            <LinkButton href="/sign-up" className="mt-5">{t.nav.register}</LinkButton>
          </div>
        )}
      </section>

      {/* ───────── How it works ───────── */}
      <section className="wrap pt-16 md:pt-24">
        <div className="rounded-3xl bg-accent-wash px-5 py-9 md:rounded-[32px] md:p-14">
          <SectionHead eyebrow={h.howEyebrow} title={h.howTitle} alt={h.howAlt} />
          <ol className="relative mt-9 grid gap-7 md:grid-cols-3 md:gap-8">
            <span aria-hidden className="absolute top-7 bottom-7 left-7 border-l-2 border-dashed border-[#b9d99a] md:top-7 md:right-16 md:bottom-auto md:left-16 md:border-t-2 md:border-l-0" />
            {h.steps.map((step, i) => (
              <li key={step.title} className="relative grid grid-cols-[56px_1fr] gap-x-4 md:block">
                <span className="num row-span-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent font-display text-2xl text-white shadow-[0_0_0_8px_var(--accent-wash)]">
                  {i + 1}
                </span>
                <h3 className="font-display text-xl md:mt-5">{step.title}</h3>
                <span className="text-sm text-accent-ink">{step.alt}</span>
                <p className="mt-1.5 leading-relaxed text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
          <LinkButton href="/sign-up" size="lg" className="mt-9">{t.nav.register}</LinkButton>
        </div>
      </section>

      {/* ───────── Keep these ready ───────── */}
      <section id="ready" className="wrap grid scroll-mt-24 items-center gap-8 pt-16 md:grid-cols-[1fr_1.2fr] md:gap-10 md:pt-24">
        <div>
          <SectionHead eyebrow={h.kitEyebrow} title={h.kitTitle} alt={h.kitAlt} />
          <p className="mt-4 max-w-md leading-relaxed text-ink-soft">{h.kitBody}</p>
        </div>
        <ul className="rounded-3xl border border-line bg-surface px-6 py-2">
          {h.kit.map((item) => (
            <li key={item.title} className="flex items-center gap-3.5 border-b border-line py-4 last:border-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <CheckIcon size={15} />
              </span>
              <span>
                <span className="block font-medium">{item.title}</span>
                <span className="text-sm text-ink-mute">{item.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── WhatsApp ───────── */}
      <section className="wrap pt-16 md:pt-24">
        <div className="relative grid gap-7 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,var(--accent)_0%,var(--deep)_100%)] px-6 py-9 text-white md:grid-cols-[1.3fr_1fr] md:items-center md:rounded-[32px] md:px-14 md:py-12">
          <span aria-hidden className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-brand-lime/20" />
          <div className="relative">
            <h2 className="font-display text-3xl leading-tight md:text-[2.4rem]">{h.ctaTitle}</h2>
            <p className="mt-2.5 text-white/85 md:text-lg">{h.ctaBody}</p>
            <p className="mt-1 text-[#cfeaa9]">{h.ctaAlt}</p>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row md:justify-end">
            <AnchorButton href={whatsappLink()} target="_blank" rel="noreferrer" size="lg" className="bg-brand-lime text-deep hover:bg-[#a0e03a]">
              <WhatsAppIcon /> {t.common.whatsapp}
            </AnchorButton>
            <AnchorButton href={SITE.phoneHref} variant="inverse" size="lg">
              <span className="num">{t.common.call} {SITE.phoneDisplay}</span>
            </AnchorButton>
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="wrap grid gap-8 py-16 md:grid-cols-[1fr_1.6fr] md:gap-10 md:py-24">
        <SectionHead eyebrow={h.faqEyebrow} title={h.faqTitle} />
        <div className="space-y-2.5">
          {HOME_FAQ.map((i, n) => {
            const item = t.about.faq[i];
            return (
              <details key={item.q} open={n === 0} className="group rounded-2xl border border-line bg-surface px-5 open:border-accent">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-semibold">
                  {item.q}
                  <PlusIcon className="details-chevron shrink-0 text-ink-mute" />
                </summary>
                <p className="-mt-1 pb-4 leading-relaxed text-ink-soft">{item.a}</p>
              </details>
            );
          })}
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, alt }: { eyebrow: string; title: string; alt?: string }) {
  return (
    <div>
      <p className="text-[13px] font-bold tracking-[0.08em] text-accent uppercase">{eyebrow}</p>
      <h2 className="mt-2 font-display text-[1.9rem] leading-tight font-extrabold md:text-[2.6rem]">{title}</h2>
      {alt && <p className="mt-1 text-ink-mute md:text-lg">{alt}</p>}
    </div>
  );
}

/** Decorative cards on the right of the hero, built from real jobs. Desktop only. */
function HeroArt({ jobs, t }: { jobs: Job[]; t: Dict }) {
  const badge = "absolute flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-ink shadow-[0_16px_36px_-14px_rgba(0,0,0,0.45)]";
  const dot = "flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent";
  return (
    <div aria-hidden className="relative hidden h-[460px] lg:block">
      <div className="absolute top-5 right-2 h-[400px] w-[400px] rounded-[48%_52%_44%_56%] bg-[linear-gradient(150deg,var(--brand-lime),#3d9a14)] opacity-95" />
      {jobs.map((job, i) => (
        <MiniJob key={job.id} job={job} t={t} className={i === 0 ? "top-14 left-2 -rotate-4" : "top-56 left-28 rotate-3"} />
      ))}
      <div className={`${badge} top-8 right-0`}><span className={dot}><CheckIcon size={18} /></span>{t.home.badges.verified}</div>
      <div className={`${badge} bottom-8 left-0`}><span className={dot}><WhatsAppIcon size={18} /></span>{t.home.badges.whatsapp}</div>
      <div className={`${badge} right-5 bottom-20`}><span className={`${dot} font-bold`}>₹0</span>{t.home.badges.free}</div>
    </div>
  );
}

function MiniJob({ job, t, className }: { job: Job; t: Dict; className: string }) {
  const salary = formatSalary(job);
  return (
    <div className={`absolute w-[330px] rounded-2xl bg-white p-4.5 text-ink shadow-[0_24px_50px_-18px_rgba(0,0,0,0.45)] ${className}`}>
      <div className="flex items-center gap-3">
        <CompanyMark name={job.company} />
        <div className="min-w-0">
          <p className="truncate font-display text-lg leading-tight">{job.title}</p>
          <p className="truncate text-[13px] text-ink-mute">{[job.company, job.location].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {isFresherFriendly(job) && <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-hover">{t.jobs.freshers}</span>}
        {job.openings ? <span className="rounded-full bg-navy-soft px-2.5 py-0.5 text-xs font-medium text-ink-soft">{t.common.openings(job.openings)}</span> : null}
      </div>
      <div className="mt-3.5 flex items-center justify-between">
        <span className="num font-bold">{salary ?? t.common.notDisclosed}</span>
        <span className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-semibold text-white">{t.common.apply}</span>
      </div>
    </div>
  );
}
