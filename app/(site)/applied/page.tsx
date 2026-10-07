import type { Metadata } from "next";

import { ApplicationsList } from "@/components/site/applications-list";
import { PageIntro } from "@/components/ui/page-intro";
import { getDict } from "@/lib/i18n-server";

export const metadata: Metadata = { title: "My applications" };

export default async function AppliedPage() {
  const t = await getDict();
  return (
    <>
      <PageIntro title={t.applied.title} lede={t.applied.lede} />
      <div className="wrap pb-24">
        <div className="max-w-3xl">
          <ApplicationsList />
        </div>
      </div>
    </>
  );
}
