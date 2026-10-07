import Link from "next/link";

import { getDict } from "@/lib/i18n-server";
import { SITE, whatsappLink } from "@/lib/site";
import { Logo } from "@/components/ui/logo";

export async function Footer() {
  const t = await getDict();

  const explore = [
    { href: "/jobs", label: t.nav.jobs },
    { href: "/sign-up", label: t.nav.register },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <footer className="mt-auto bg-deep text-white/75">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div className="max-w-xs">
          <span className="inline-block rounded-2xl bg-white px-3 py-2"><Logo height={52} /></span>
          <p className="mt-4 text-sm leading-relaxed">{t.footer.tagline}</p>
        </div>

        <div>
          <h2 className="text-[13px] font-bold tracking-[0.08em] text-white uppercase">{t.footer.explore}</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link hover:text-white">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[13px] font-bold tracking-[0.08em] text-white uppercase">{t.footer.reach}</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li><a href={SITE.phoneHref} className="link num hover:text-white">{SITE.phoneDisplay}</a></li>
            <li><a href={whatsappLink()} target="_blank" rel="noreferrer" className="link hover:text-white">WhatsApp</a></li>
            <li><a href={`mailto:${SITE.email}`} className="link hover:text-white">{SITE.email}</a></li>
            <li className="text-white/60">{SITE.address}</li>
            <li className="text-white/60">{t.contact.hoursValue}</li>
          </ul>
        </div>
      </div>
      <div className="wrap flex flex-col gap-1 border-t border-white/10 py-5 text-[13px] text-white/55 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} MyJobSolution. {t.footer.rights}</p>
        <p>{t.common.free}</p>
      </div>
    </footer>
  );
}
