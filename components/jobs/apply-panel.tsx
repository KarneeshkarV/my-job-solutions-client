"use client";

import Link from "next/link";

import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { useSite } from "@/components/site/site-provider";
import type { Job } from "@/lib/job-utils";

/** Apply button plus its status line. `compact` is the mobile bottom bar. */
export function ApplyPanel({ job, compact = false }: { job: Job; compact?: boolean }) {
  const t = useDict();
  const { hasApplied, startApply, authLoaded } = useSite();
  const applied = hasApplied(job.id);

  const button = applied ? (
    <Link
      href="/applied"
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent-soft font-medium text-accent-hover"
    >
      <CheckIcon /> {t.common.applied}
    </Link>
  ) : (
    <Button size="lg" className="w-full" onClick={() => startApply(job)} disabled={!authLoaded}>
      {t.common.applyNow}
    </Button>
  );

  if (compact) return button;

  return (
    <div>
      {button}
      <p className="mt-3 text-sm leading-relaxed text-ink-mute">{applied ? t.job.appliedHint : t.job.applyHint}</p>
    </div>
  );
}
