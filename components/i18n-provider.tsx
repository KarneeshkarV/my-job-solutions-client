"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DICTS, LANG_COOKIE, type Dict, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useDict(): Dict {
  return DICTS[useContext(LangContext)];
}

/** Switches between English and Hindi. The choice is kept in a cookie. */
export function useToggleLang() {
  const lang = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next: Lang = lang === "en" ? "hi" : "en";
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    startTransition(() => router.refresh());
  };

  return { toggle, pending };
}
