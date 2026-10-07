import type { ReactNode } from "react";

/** Left-aligned page heading used at the top of inner pages. */
export function PageIntro({ eyebrow, title, lede, children }: { eyebrow?: string; title: string; lede?: string; children?: ReactNode }) {
  return (
    <div className="wrap animate-rise pt-12 pb-8 md:pt-16 md:pb-10">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-3 max-w-2xl font-display text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl">{title}</h1>
      {lede && <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">{lede}</p>}
      {children}
    </div>
  );
}
