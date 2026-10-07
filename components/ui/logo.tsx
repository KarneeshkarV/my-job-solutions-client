import Link from "next/link";

/** The magnifier from the logo, redrawn as a clean mark. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="14" cy="14" r="10" fill="none" stroke="var(--accent)" strokeWidth="3.2" />
      <path d="m21.5 21.5 6 6" stroke="var(--accent)" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="14" cy="11" r="2.6" fill="var(--ink)" />
      <path d="M9.2 19.4c.5-2.6 2.5-4.2 4.8-4.2s4.3 1.6 4.8 4.2" fill="var(--ink)" />
      <path d="m14 15.4.9 1.2-.9 3.1-.9-3.1Z" fill="var(--signal)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md" aria-label="MyJobSolution home">
      <LogoMark />
      <span className="font-display text-[1.3rem] leading-none tracking-tight text-ink">
        MyJob<span className="text-accent">Solution</span>
      </span>
    </Link>
  );
}
