"use client";

import { useEffect, useRef, useState } from "react";

import type { PublicUserProfile } from "@/lib/public-api";
import type { Job } from "@/lib/job-utils";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { CloseIcon, FileIcon } from "@/components/ui/icons";

type Props = {
  job: Job;
  profile: PublicUserProfile;
  onClose: () => void;
  onSubmitted: (profile: PublicUserProfile) => Promise<void>;
};

export function ApplyDialog({ job, profile, onClose, onSubmitted }: Props) {
  const t = useDict().apply;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState({ ...profile, interestedJob: job.title });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const resumeName = draft.resumeName || "default_resume.pdf";
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: job.id, profile: { ...draft, resumeName } }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? t.failed);
      }
      await onSubmitted({ ...draft, resumeName });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-surface p-0 text-ink shadow-[0_24px_60px_-20px_rgba(14,26,43,0.35)] backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] open:animate-rise"
    >
      <form onSubmit={submit}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 pt-5 pb-4">
          <div>
            <p className="eyebrow">{t.applyingFor}</p>
            <h2 className="mt-1 font-display text-xl leading-snug">{job.title}</h2>
            <p className="text-sm text-ink-mute">{job.company}</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="-mr-2 rounded-md p-2 text-ink-mute hover:bg-paper-sunk hover:text-ink"
            aria-label={t.cancel}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-ink-soft">{t.check}</p>
          <Field label={t.name} htmlFor="apply-name">
            <Input
              id="apply-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              autoComplete="name"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.mobile} htmlFor="apply-mobile">
              <Input
                id="apply-mobile"
                inputMode="numeric"
                maxLength={10}
                value={draft.mobile}
                onChange={(e) => setDraft({ ...draft, mobile: e.target.value.replace(/\D/g, "") })}
                className="num"
                required
              />
            </Field>
            <Field label={t.district} htmlFor="apply-district">
              <Input
                id="apply-district"
                value={draft.district}
                onChange={(e) => setDraft({ ...draft, district: e.target.value })}
                required
              />
            </Field>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-paper px-3.5 py-3 text-sm">
            <FileIcon className="shrink-0 text-ink-mute" />
            <div className="min-w-0">
              <p className="text-ink-mute">{t.resume}</p>
              <p className="truncate font-medium">{draft.resumeName || t.noResume}</p>
            </div>
          </div>
          {error && <FormMessage tone="error">{error}</FormMessage>}
        </div>

        <div className="flex justify-end gap-2 border-t border-line bg-paper/60 px-6 py-4">
          <Button variant="ghost" onClick={() => dialogRef.current?.close()}>
            {t.cancel}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? t.submitting : t.submit}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
