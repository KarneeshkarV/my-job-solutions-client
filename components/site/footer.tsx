import Link from "next/link";

import { getDict } from "@/lib/i18n-server";
import { SITE, whatsappLink } from "@/lib/site";
import { Logo } from "@/components/ui/logo";

export async function Footer() {
  const t = await getDict();

  const explore = [
    { href: "/jobs", label: t.nav.jobs },
    { href: "/profile", label: t.nav.register },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-paper-sunk/60">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div className="max-w-xs">
          <Logo height={56} />
          <p className="mt-3 text-sm leading-relaxed text-ink-mute">{t.footer.tagline}</p>
        </div>

        <div>
          <h2 className="eyebrow">{t.footer.explore}</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link text-ink-soft hover:text-ink">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">{t.footer.reach}</h2>
          <ul className="mt-4 space-y-2.5 text-[15px] text-ink-soft">
            <li><a href={SITE.phoneHref} className="link num hover:text-ink">{SITE.phoneDisplay}</a></li>
            <li><a href={whatsappLink()} target="_blank" rel="noreferrer" className="link hover:text-ink">WhatsApp</a></li>
            <li><a href={`mailto:${SITE.email}`} className="link hover:text-ink">{SITE.email}</a></li>
            <li className="text-ink-mute">{SITE.address}</li>
            <li className="text-ink-mute">{t.contact.hoursValue}</li>
          </ul>
        </div>
      </div>
      <div className="wrap flex flex-col gap-1 border-t border-line py-5 text-[13px] text-ink-mute sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} MyJobSolution. {t.footer.rights}</p>
        <p>{t.common.free}</p>
      </div>
    </footer>
  );
}
