import Link from "next/link";
import { redirect } from "next/navigation";

import { JobRow } from "@/components/jobs/job-row";
import { AnchorButton, LinkButton } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon, PhoneIcon, PinIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getDict } from "@/lib/i18n-server";
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

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { tab } = await searchParams;
  if (typeof tab === "string" && LEGACY_TABS[tab]) {
    redirect(LEGACY_TABS[tab]);
  }

  const [t, jobs] = await Promise.all([getDict(), getOpenJobs()]);
  const latest = jobs.slice(0, 4);

  // Towns with open jobs, busiest first.
  const byTown = [...jobs.reduce((m, j) => (j.location ? m.set(j.location, (m.get(j.location) ?? 0) + 1) : m), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <>
      {/* Hero */}
      <div className="border-b border-line bg-[radial-gradient(60rem_28rem_at_85%_-10%,var(--accent-soft),transparent_70%)]">
      <section className="wrap grid gap-12 pt-14 pb-16 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-24">
        <div className="animate-rise">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1 className="mt-5 max-w-xl font-display text-[2.6rem] leading-[1.05] tracking-tight text-balance sm:text-6xl">
            {t.home.title}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">{t.home.lede}</p>

          <form
            action="/jobs"
            role="search"
            className="mt-9 flex max-w-xl flex-col gap-2 rounded-xl border border-line-strong bg-surface p-2 shadow-[0_8px_24px_-16px_rgba(16,85,20,0.35)] focus-within:border-accent sm:flex-row sm:items-center sm:gap-0"
          >
            <label htmlFor="hero-q" className="sr-only">{t.home.searchPlaceholder}</label>
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-mute" />
              <input
                id="hero-q"
                name="q"
                type="search"
                placeholder={t.home.searchPlaceholder}
                className="h-11 w-full rounded-lg bg-transparent pr-3 pl-10 text-base placeholder:text-ink-mute/80 focus:outline-none"
              />
            </div>
            {byTown.length > 1 && (
              <div className="relative border-t border-line sm:w-44 sm:border-t-0 sm:border-l">
                <PinIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-mute" />
                <label htmlFor="hero-loc" className="sr-only">{t.home.where}</label>
                <select
                  id="hero-loc"
                  name="loc"
                  defaultValue=""
                  className="h-11 w-full cursor-pointer appearance-none bg-transparent pr-3 pl-10 text-base text-ink-soft sm:text-[15px] focus:outline-none"
                >
                  <option value="">{t.home.anywhere}</option>
                  {byTown.map(([town]) => <option key={town} value={town}>{town}</option>)}
                </select>
              </div>
            )}
            <button type="submit" className="h-11 cursor-pointer rounded-lg bg-accent px-6 font-medium text-white transition-colors hover:bg-accent-hover">
              {t.home.search}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-ink-soft hover:text-ink">
              <WhatsAppIcon className="text-[#1faa53]" />
              <span className="link">{t.common.whatsapp}</span>
            </a>
            <a href={SITE.phoneHref} className="inline-flex items-center gap-2 text-ink-soft hover:text-ink">
              <PhoneIcon className="text-ink-mute" />
              <span className="link num">{SITE.phoneDisplay}</span>
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-ink-soft">
            {t.home.promises.map((p) => (
              <li key={p.title} className="inline-flex items-center gap-2">
                <CheckIcon size={16} className="text-accent" /> {p.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Latest openings */}
        <aside className="animate-rise self-start rounded-xl border border-line bg-surface/60 [animation-delay:80ms]" aria-labelledby="latest-heading">
          <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
            <h2 id="latest-heading" className="flex items-center gap-2.5 text-[15px] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {t.home.latest}
            </h2>
            {jobs.length > 0 && <span className="num text-sm text-ink-mute">{t.jobs.count(jobs.length)}</span>}
          </div>
          {latest.length > 0 ? (
            <>
              <ul className="divide-y divide-line px-4 sm:px-3">
                {latest.map((job) => <JobRow key={job.id} job={job} compact />)}
              </ul>
              <Link href="/jobs" className="group flex items-center justify-between border-t border-line px-5 py-4 text-[15px] text-accent sm:px-6">
                <span className="link">{t.common.viewAll}</span>
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          ) : (
            <div className="px-6 py-10">
              <p className="max-w-sm text-ink-soft">{t.home.latestEmpty}</p>
              <LinkButton href="/profile" className="mt-5">{t.nav.register}</LinkButton>
            </div>
          )}
        </aside>
      </section>
      </div>

      {/* Jobs by town */}
      {byTown.length > 1 && (
        <section className="wrap py-14 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl">{t.home.byLocation}</h2>
              <p className="mt-1 text-ink-mute">{t.home.byLocationLede}</p>
            </div>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {byTown.slice(0, 8).map(([town, count]) => (
              <li key={town}>
                <Link
                  href={`/jobs?loc=${encodeURIComponent(town)}`}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3.5 transition-colors hover:border-accent/40 hover:bg-accent-wash"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{town}</span>
                    <span className="num text-sm text-ink-mute">{t.jobs.count(count)}</span>
                  </span>
                  <ArrowRightIcon size={16} className="shrink-0 text-ink-mute transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* How it works */}
      <section className="border-y border-line bg-accent-wash/70">
        <div className="wrap py-16 md:py-24">
          <p className="eyebrow">{t.home.howEyebrow}</p>
          <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
            {t.home.howTitle}
          </h2>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
            {t.home.steps.map((step, i) => (
              <li key={step.title} className="bg-surface p-6 sm:p-8">
                <span className="num font-display text-4xl text-brand-mid">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-lg font-medium">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Promises */}
      <section className="wrap grid gap-10 py-16 md:grid-cols-[1fr_1.5fr] md:py-24">
        <div>
          <p className="eyebrow">{t.home.promiseEyebrow}</p>
          <h2 className="mt-3 max-w-sm font-display text-3xl leading-tight tracking-tight text-balance">
            {t.home.promiseTitle}
          </h2>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {t.home.promises.map((item) => (
            <li key={item.title} className="flex gap-4 py-6">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <CheckIcon size={16} />
              </span>
              <div>
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-1 leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing call to action */}
      <section className="wrap pb-20">
        <div className="flex flex-col gap-8 brand-gradient rounded-2xl px-6 py-10 text-white sm:px-10 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="max-w-lg">
            <h2 className="font-display text-3xl leading-tight">{t.home.ctaTitle}</h2>
            <p className="mt-3 leading-relaxed text-white/85">{t.home.ctaBody}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <AnchorButton href={whatsappLink()} target="_blank" rel="noreferrer" variant="whatsapp" size="lg">
              <WhatsAppIcon /> {t.common.whatsapp}
            </AnchorButton>
            <AnchorButton href={SITE.phoneHref} variant="inverse" size="lg">
              <PhoneIcon /> {t.common.call}
            </AnchorButton>
          </div>
        </div>
      </section>
    </>
  );
}
