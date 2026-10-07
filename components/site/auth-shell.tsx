import type { ReactNode } from "react";

import { CheckIcon } from "@/components/ui/icons";
import { getDict } from "@/lib/i18n-server";

/** Shared frame for the Clerk sign-in and sign-up widgets. */
export async function AuthShell({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  const t = await getDict();
  return (
    <div className="wrap grid items-start gap-10 py-12 md:grid-cols-[1fr_auto] md:gap-16 md:py-20">
      <div className="max-w-md animate-rise md:pt-8">
        <h1 className="font-display text-4xl leading-[1.1] tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{body}</p>
        <ul className="mt-8 space-y-3 text-ink-soft">
          {t.home.promises.map((p) => (
            <li key={p.title} className="flex gap-3">
              <CheckIcon className="mt-1 shrink-0 text-accent" />
              {p.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center md:justify-end">{children}</div>
    </div>
  );
}
