"use client";

import { useState } from "react";

import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { SendIcon } from "@/components/ui/icons";

const EMPTY = { name: "", mobile: "", email: "", location: "", message: "" };

export function ContactForm() {
  const t = useDict().contact;
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: key === "mobile" ? e.target.value.replace(/\D/g, "") : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim() || !form.message.trim()) {
      setStatus({ tone: "error", text: t.errRequired });
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? t.failed);
      }
      setForm(EMPTY);
      setStatus({ tone: "success", text: t.sent });
    } catch (err) {
      setStatus({ tone: "error", text: err instanceof Error ? err.message : t.failed });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-xl border border-line bg-surface p-6 sm:p-8">
      <h2 className="font-display text-2xl">{t.formTitle}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={t.name} htmlFor="c-name" required>
          <Input id="c-name" autoComplete="name" value={form.name} onChange={set("name")} />
        </Field>
        <Field label={t.mobile} htmlFor="c-mobile" required>
          <Input id="c-mobile" inputMode="numeric" maxLength={10} autoComplete="tel-national" value={form.mobile} onChange={set("mobile")} className="num" />
        </Field>
        <Field label={t.emailField} htmlFor="c-email" optional={t.optional}>
          <Input id="c-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
        </Field>
        <Field label={t.location} htmlFor="c-location" optional={t.optional}>
          <Input id="c-location" value={form.location} onChange={set("location")} />
        </Field>
        <Field label={t.message} htmlFor="c-message" required className="sm:col-span-2">
          <Textarea id="c-message" rows={4} value={form.message} onChange={set("message")} placeholder={t.messagePlaceholder} />
        </Field>
      </div>
      {status && <div className="mt-5"><FormMessage tone={status.tone}>{status.text}</FormMessage></div>}
      <Button type="submit" size="lg" disabled={sending} className="mt-6 w-full sm:w-auto">
        <SendIcon size={16} /> {sending ? t.sending : t.send}
      </Button>
    </form>
  );
}
