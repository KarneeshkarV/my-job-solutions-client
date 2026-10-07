import type { Metadata } from "next";

import { ContactForm } from "@/components/site/contact-form";
import { AnchorButton } from "@/components/ui/button";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, SendIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getDict } from "@/lib/i18n-server";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, WhatsApp or visit MyJobSolution in Khalilabad, Sant Kabir Nagar. Mon – Sat, 10 am – 7 pm.",
};

export default async function ContactPage() {
  const t = await getDict();
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapQuery)}`;

  const rows = [
    {
      icon: MailIcon,
      label: t.contact.email,
      body: <a href={`mailto:${SITE.email}`} className="link">{SITE.email}</a>,
    },
    {
      icon: SendIcon,
      label: t.contact.telegram,
      body: <a href={`https://t.me/${SITE.telegram}`} target="_blank" rel="noreferrer" className="link">@{SITE.telegram}</a>,
    },
    {
      icon: PinIcon,
      label: t.contact.office,
      body: (
        <>
          {SITE.address}
          <br />
          <a href={mapsHref} target="_blank" rel="noreferrer" className="link text-accent">{t.contact.directions}</a>
        </>
      ),
    },
    {
      icon: ClockIcon,
      label: t.contact.hours,
      body: <>{t.contact.hoursValue}<br /><span className="text-ink-mute">{t.contact.closed}</span></>,
    },
  ];

  return (
    <div className="wrap grid gap-12 pt-12 pb-24 md:pt-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
      <div className="animate-rise">
        <p className="eyebrow">{t.contact.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl">{t.contact.title}</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">{t.contact.lede}</p>

        <div className="mt-10">
          <p className="text-sm text-ink-mute">{t.contact.phone}</p>
          <a href={SITE.phoneHref} className="num mt-1 block font-display text-3xl tracking-tight hover:text-accent sm:text-4xl">
            {SITE.phoneDisplay}
          </a>
          <div className="mt-5 flex flex-wrap gap-2">
            <AnchorButton href={SITE.phoneHref}><PhoneIcon /> {t.common.call}</AnchorButton>
            <AnchorButton href={whatsappLink()} target="_blank" rel="noreferrer" variant="secondary">
              <WhatsAppIcon className="text-[#1faa53]" /> {t.common.whatsapp}
            </AnchorButton>
          </div>
        </div>

        <dl className="mt-10 divide-y divide-line border-y border-line">
          {rows.map(({ icon: Icon, label, body }) => (
            <div key={label} className="flex gap-4 py-4">
              <Icon className="mt-1 shrink-0 text-ink-mute" />
              <div>
                <dt className="text-sm text-ink-mute">{label}</dt>
                <dd className="mt-0.5 leading-relaxed">{body}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="lg:pt-6">
        <ContactForm />
      </div>
    </div>
  );
}
