"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useDict, useToggleLang } from "@/components/i18n-provider";
import { Logo } from "@/components/ui/logo";
import { LinkButton } from "@/components/ui/button";
import { CloseIcon, MenuIcon, UserIcon } from "@/components/ui/icons";
import { initials } from "@/lib/job-utils";
import { useSite } from "./site-provider";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const t = useDict().nav;
  const pathname = usePathname();
  const { authLoaded, isSignedIn, profile, applications, signOut } = useSite();
  const { toggle, pending } = useToggleLang();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "/jobs", label: t.jobs },
    ...(isSignedIn ? [{ href: "/applied", label: t.applied, count: applications.length }] : []),
    { href: "/about", label: t.about },
    { href: "/contact", label: t.contact },
  ];

  const langButton = (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      lang={t.switchLang === "English" ? "en" : "hi"}
      aria-label={t.switchLangLabel}
      className="rounded-md px-2.5 py-1.5 text-sm text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink disabled:opacity-60"
    >
      {t.switchLang}
    </button>
  );

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <div className="wrap flex h-19 items-center justify-between gap-6">
        <Logo height={60} />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-md px-3 py-2 text-[15px] transition-colors ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
                {"count" in link && link.count ? (
                  <span className="num ml-1.5 rounded-full bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent-hover">
                    {link.count}
                  </span>
                ) : null}
                {active && <span className="absolute inset-x-3 -bottom-[19px] h-0.5 rounded-full bg-accent" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {langButton}
          <span className="h-5 w-px bg-line" aria-hidden />
          {!authLoaded ? (
            <span className="h-9 w-24" aria-hidden />
          ) : isSignedIn ? (
            <div className="flex items-center gap-1">
              <Link
                href="/profile"
                aria-current={pathname === "/profile" ? "page" : undefined}
                className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent-wash py-1 pr-3.5 pl-1 transition-colors hover:border-accent/50 hover:bg-accent-soft aria-[current=page]:border-accent"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-bold tracking-wide text-accent-hover ring-2 ring-white">
                  {initials(profile?.name ?? "") || <UserIcon size={16} />}
                </span>
                <span className="max-w-32 truncate text-sm font-semibold text-ink">{profile?.name?.split(" ")[0] || t.profile}</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md px-2.5 py-1.5 text-sm text-ink-mute transition-colors hover:bg-paper-sunk hover:text-ink"
              >
                {t.signOut}
              </button>
            </div>
          ) : (
            <>
              <LinkButton href="/sign-in" variant="ghost" size="sm">{t.signIn}</LinkButton>
              <LinkButton href="/sign-up" size="sm">{t.register}</LinkButton>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.close : t.menu}
          className="-mr-2 rounded-md p-2 text-ink md:hidden"
        >
          {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>
    </header>

      {/* Outside <header>: its backdrop-filter would trap a fixed child. */}
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-19 bottom-0 z-40 animate-fade overflow-y-auto bg-paper md:hidden">
          <nav aria-label="Mobile" className="wrap flex flex-col py-4">
            {[{ href: "/", label: t.home }, ...links].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className="flex items-center justify-between border-b border-line py-4 font-display text-2xl aria-[current=page]:text-accent"
              >
                {link.label}
                {"count" in link && link.count ? (
                  <span className="num font-sans text-sm text-ink-mute">{link.count}</span>
                ) : null}
              </Link>
            ))}
            {isSignedIn && (
              <Link href="/profile" className="border-b border-line py-4 font-display text-2xl aria-[current=page]:text-accent" aria-current={pathname === "/profile" ? "page" : undefined}>
                {t.profile}
              </Link>
            )}
          </nav>
          <div className="wrap flex flex-col gap-3 pb-10">
            {isSignedIn ? (
              <button type="button" onClick={signOut} className="h-12 rounded-lg border border-line-strong text-ink-soft">
                {t.signOut}
              </button>
            ) : (
              <>
                <LinkButton href="/sign-up" size="lg">{t.register}</LinkButton>
                <LinkButton href="/sign-in" variant="secondary" size="lg">{t.signIn}</LinkButton>
              </>
            )}
            <div className="pt-2 text-center">{langButton}</div>
          </div>
        </div>
      )}
    </>
  );
}
