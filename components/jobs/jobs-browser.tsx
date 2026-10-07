"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useDict } from "@/components/i18n-provider";
import { AnchorButton, Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { CloseIcon, FilterIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/icons";
import { isFresherFriendly, maxSalary, minSalary, type Job } from "@/lib/job-utils";
import { whatsappLink } from "@/lib/site";
import { JobRow } from "./job-row";

const PAGE_SIZE = 10;

export type JobFilters = { q: string; loc: string; exp: "" | "fresher" | "experienced"; sort: "" | "salary-high" | "salary-low"; page: number };

function filterJobs(jobs: Job[], f: JobFilters): Job[] {
  const q = f.q.trim().toLowerCase();
  const result = jobs.filter((job) => {
    if (q) {
      const haystack = [job.title, job.company, job.location, ...job.skills].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.loc && job.location !== f.loc) return false;
    if (f.exp === "fresher" && !isFresherFriendly(job)) return false;
    if (f.exp === "experienced" && isFresherFriendly(job)) return false;
    return true;
  });
  if (f.sort === "salary-high") return [...result].sort((a, b) => maxSalary(b) - maxSalary(a));
  if (f.sort === "salary-low") return [...result].sort((a, b) => (minSalary(a) || Infinity) - (minSalary(b) || Infinity));
  return result;
}

/** Keeps filters in the URL so a filtered list can be shared or bookmarked. */
function syncUrl(f: JobFilters) {
  const params = new URLSearchParams();
  if (f.q) params.set("q", f.q);
  if (f.loc) params.set("loc", f.loc);
  if (f.exp) params.set("exp", f.exp);
  if (f.sort) params.set("sort", f.sort);
  if (f.page > 1) params.set("page", String(f.page));
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

export function JobsBrowser({ jobs, initial }: { jobs: Job[]; initial: JobFilters }) {
  const t = useDict();
  const [filters, setFilters] = useState<JobFilters>(initial);
  const [sheetOpen, setSheetOpen] = useState(false);
  const listTop = useRef<HTMLDivElement>(null);

  const locations = useMemo(
    () => [...new Set(jobs.flatMap((j) => (j.location ? [j.location] : [])))].sort((a, b) => a.localeCompare(b)),
    [jobs],
  );
  const filtered = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = [filters.loc, filters.exp, filters.sort].filter(Boolean).length;

  useEffect(() => {
    syncUrl(filters);
  }, [filters]);

  const update = (patch: Partial<JobFilters>) => setFilters((f) => ({ ...f, page: 1, ...patch }));
  const clear = () => setFilters({ q: "", loc: "", exp: "", sort: "", page: 1 });
  const goTo = (p: number) => {
    setFilters((f) => ({ ...f, page: p }));
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selects = (
    <>
      <label className="sr-only" htmlFor="f-loc">{t.jobs.location}</label>
      <Select id="f-loc" value={filters.loc} onChange={(e) => update({ loc: e.target.value })}>
        <option value="">{t.jobs.allLocations}</option>
        {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
      </Select>
      <label className="sr-only" htmlFor="f-exp">{t.jobs.experience}</label>
      <Select id="f-exp" value={filters.exp} onChange={(e) => update({ exp: e.target.value as JobFilters["exp"] })}>
        <option value="">{t.jobs.anyExperience}</option>
        <option value="fresher">{t.jobs.freshers}</option>
        <option value="experienced">{t.jobs.experienced}</option>
      </Select>
      <label className="sr-only" htmlFor="f-sort">{t.jobs.sort}</label>
      <Select id="f-sort" value={filters.sort} onChange={(e) => update({ sort: e.target.value as JobFilters["sort"] })}>
        <option value="">{t.jobs.sortLatest}</option>
        <option value="salary-high">{t.jobs.sortSalaryHigh}</option>
        <option value="salary-low">{t.jobs.sortSalaryLow}</option>
      </Select>
    </>
  );

  if (jobs.length === 0) {
    return (
      <div className="wrap pb-24">
        <EmptyState title={t.jobs.noneTitle} body={t.jobs.noneBody}>
          <LinkButton href="/profile">{t.nav.register}</LinkButton>
          <AnchorButton href={whatsappLink()} target="_blank" rel="noreferrer" variant="secondary">
            <WhatsAppIcon className="text-[#1faa53]" /> {t.common.whatsapp}
          </AnchorButton>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      {/* Filter bar */}
      <div className="sticky top-19 z-30 border-y border-line bg-paper/95 backdrop-blur-md">
        <div className="wrap flex items-center gap-2 py-3">
          <div className="relative min-w-0 flex-1 md:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-mute" />
            <label htmlFor="f-q" className="sr-only">{t.jobs.search}</label>
            <input
              id="f-q"
              type="search"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder={t.jobs.search}
              className="h-11 w-full rounded-lg border border-line-strong bg-surface pr-3 pl-10 text-base placeholder:text-ink-mute/80 focus:border-accent focus:ring-3 focus:ring-accent/15 focus:outline-none"
            />
          </div>
          <div className="hidden flex-1 grid-cols-3 gap-2 md:grid">{selects}</div>
          <Button variant="secondary" className="md:hidden" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
            <FilterIcon /> {t.jobs.filters}
            {activeCount > 0 && <span className="num rounded-full bg-accent px-1.5 text-xs text-white">{activeCount}</span>}
          </Button>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t.jobs.filters}>
          <button type="button" aria-label={t.nav.close} className="absolute inset-0 animate-fade bg-ink/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 animate-rise rounded-t-2xl bg-paper px-5 pt-4 pb-8 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong" aria-hidden />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">{t.jobs.filters}</h2>
              <button type="button" onClick={() => setSheetOpen(false)} className="-mr-2 p-2 text-ink-mute" aria-label={t.nav.close}>
                <CloseIcon />
              </button>
            </div>
            <div className="flex flex-col gap-3">{selects}</div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={clear}>{t.jobs.clear}</Button>
              <Button onClick={() => setSheetOpen(false)}>{t.jobs.showResults}</Button>
            </div>
          </div>
        </div>
      )}

      <div ref={listTop} className="wrap scroll-mt-40 pt-6 pb-24">
        <div className="flex items-center justify-between text-sm text-ink-mute">
          <p className="num" aria-live="polite">{t.jobs.count(filtered.length)}</p>
          {(activeCount > 0 || filters.q) && (
            <button type="button" onClick={clear} className="link text-ink-soft hover:text-ink">{t.jobs.clear}</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title={t.jobs.emptyTitle} body={t.jobs.emptyBody}>
            <Button variant="secondary" onClick={clear}>{t.jobs.clear}</Button>
            <AnchorButton href={whatsappLink()} target="_blank" rel="noreferrer" variant="ghost">
              <WhatsAppIcon className="text-[#1faa53]" /> {t.common.whatsapp}
            </AnchorButton>
          </EmptyState>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {visible.map((job) => <JobRow key={job.id} job={job} />)}
          </ul>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>{t.jobs.prev}</Button>
            <p className="num text-sm text-ink-mute">{t.jobs.page(page, pages)}</p>
            <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => goTo(page + 1)}>{t.jobs.next}</Button>
          </nav>
        )}
      </div>
    </>
  );
}
