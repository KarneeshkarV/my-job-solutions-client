import type { Metadata } from "next";

import { LinkButton } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { getDict } from "@/lib/i18n-server";
import { initials } from "@/lib/job-utils";

export const metadata: Metadata = {
  title: "About us",
  description: "MyJobSolution is a recruitment and manpower consultancy in Khalilabad, Sant Kabir Nagar. Free for job seekers.",
};

// Team photos go in /public/team/<file> and are listed here, in team order.
// Until a photo is added, initials are shown.
const TEAM_PHOTOS: (string | null)[] = [null, null, null];

export default async function AboutPage() {
  const t = await getDict();

  return (
    <>
      <section className="wrap grid animate-rise gap-8 pt-12 pb-16 md:grid-cols-[1fr_1.1fr] md:gap-16 md:pt-16 md:pb-24">
        <div>
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl">{t.about.title}</h1>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-ink-soft md:pt-9">
          {t.about.body.map((p) => <p key={p}>{p}</p>)}
        </div>
      </section>

      <section className="border-y border-line bg-surface/50">
        <div className="wrap py-16 md:py-20">
          <p className="eyebrow">{t.home.promiseEyebrow}</p>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
            {t.home.promises.map((item) => (
              <li key={item.title} className="bg-paper p-6 sm:p-8">
                <h2 className="text-lg font-medium">{item.title}</h2>
                <p className="mt-2 leading-relaxed text-ink-soft">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap py-16 md:py-24">
        <p className="eyebrow">{t.about.teamEyebrow}</p>
        <ul className="mt-8 grid gap-8 sm:grid-cols-3">
          {t.about.team.map((member, i) => {
            const photo = TEAM_PHOTOS[i];
            return (
              <li key={member.name} className="flex items-center gap-4 sm:block">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-paper-sunk sm:aspect-[4/5] sm:h-auto sm:w-auto">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-2xl text-ink-mute/50 sm:text-6xl" aria-hidden>
                      {initials(member.name)}
                    </div>
                  )}
                </div>
                <div className="sm:mt-4">
                  <h3 className="text-lg font-medium">{member.name}</h3>
                  <p className="text-ink-mute">{member.role}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-line">
        <div className="wrap grid gap-10 py-16 md:grid-cols-[1fr_1.6fr] md:py-24">
          <div>
            <p className="eyebrow">{t.about.faqEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl leading-tight">{t.about.faqTitle}</h2>
            <LinkButton href="/contact" variant="secondary" className="mt-6">{t.nav.contact}</LinkButton>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {t.about.faq.map((item, i) => (
              <details key={item.q} className="group" open={i === 0}>
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-[17px] font-medium hover:text-accent">
                  {item.q}
                  <PlusIcon className="details-chevron shrink-0 text-ink-mute" />
                </summary>
                <p className="-mt-1 pb-6 leading-relaxed text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
