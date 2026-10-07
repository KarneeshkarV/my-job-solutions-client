import type { Metadata } from "next";

import { JobsBrowser, type JobFilters } from "@/components/jobs/jobs-browser";
import { PageIntro } from "@/components/ui/page-intro";
import { getDict } from "@/lib/i18n-server";
import { getOpenJobs } from "@/lib/jobs";

export const metadata: Metadata = {
  title: "Open jobs",
  description: "Verified job openings from MyJobSolution, Khalilabad. Apply online for free.",
};

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const params = await searchParams;
  const [t, jobs] = await Promise.all([getDict(), getOpenJobs()]);

  const exp = one(params.exp);
  const sort = one(params.sort);
  const initial: JobFilters = {
    q: one(params.q),
    loc: one(params.loc),
    exp: exp === "fresher" || exp === "experienced" ? exp : "",
    sort: sort === "salary-high" || sort === "salary-low" ? sort : "",
    page: Math.max(1, Number(one(params.page)) || 1),
  };

  return (
    <>
      <PageIntro title={t.jobs.title} lede={t.jobs.lede} />
      {/* key resets client state when the URL is changed from outside, e.g. the header search. */}
      <JobsBrowser key={JSON.stringify(initial)} jobs={jobs} initial={initial} />
    </>
  );
}
