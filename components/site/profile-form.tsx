"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useDict } from "@/components/i18n-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { CheckIcon, FileIcon, UploadIcon } from "@/components/ui/icons";
import type { PublicUserProfile } from "@/lib/public-api";
import { useSite } from "./site-provider";

// Values are stored as-is in the database; keep existing spellings.
const DISTRICTS = [
  "Sant Kabir Nagar",
  "Basti",
  "Gorakhpur",
  "Siddharthnagar",
  "Maharajganj",
  "Deoria",
  "Kushinagar",
  "Ambedkar Nagar",
  "Lucknow",
  "Kanpur Nagar",
  "Kanpur Dehat",
  "Varanasi",
  "Allahabad (Prayagraj)",
  "Agra",
  "Unnao",
  "Fatehpur",
  "Other",
];
const QUALIFICATIONS = [
  { value: "10th Pass", label: "10th Pass" },
  { value: "12th Pass", label: "12th Pass" },
  { value: "ITI / Diploma", label: "ITI / Diploma" },
  { value: "Graduate", label: "Graduate (B.A. / B.Sc. / B.Com etc.)" },
];
const EXPERIENCE = ["Fresher (No experience)", "Less than 1 year", "1–2 years", "2–5 years", "5+ years"];

type FormState = Omit<PublicUserProfile, "resumeName" | "altMobile"> & { altMobile: string };
type Key = keyof FormState;

const STEPS: Key[][] = [
  ["name", "fatherName", "mobile", "altMobile", "address", "district", "aadhaarLast4"],
  ["qualification", "experience", "skills", "interestedJob"],
  [],
];
const OPTIONAL: Key[] = ["altMobile"];

function toForm(profile: PublicUserProfile | null, interest: string): FormState {
  return {
    name: profile?.name ?? "",
    fatherName: profile?.fatherName ?? "",
    mobile: profile?.mobile ?? "",
    altMobile: profile?.altMobile ?? "",
    address: profile?.address ?? "",
    district: profile?.district ?? "",
    aadhaarLast4: profile?.aadhaarLast4 ?? "",
    qualification: profile?.qualification ?? "",
    experience: profile?.experience ?? "",
    skills: profile?.skills ?? "",
    interestedJob: profile?.interestedJob || interest,
  };
}

export function ProfileHeading() {
  const t = useDict().profile;
  const { isSignedIn, profileLoaded, profile } = useSite();
  const editing = isSignedIn && profileLoaded && !!profile;
  return (
    <div className="animate-rise pt-12 pb-8 md:pt-16 md:pb-10">
      <h1 className="max-w-2xl font-display text-4xl leading-[1.1] tracking-tight md:text-5xl">
        {editing ? t.title : t.createTitle}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">{editing ? t.editLede : t.createLede}</p>
    </div>
  );
}

export function ProfileSection() {
  const t = useDict().profile;
  const { authLoaded, isSignedIn, profileLoaded, profile } = useSite();

  if (!authLoaded || (isSignedIn && !profileLoaded)) {
    return <div className="h-96 animate-pulse rounded-xl bg-paper-sunk" aria-busy />;
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 sm:p-10">
        <h2 className="font-display text-3xl">{t.signedOutTitle}</h2>
        <p className="mt-3 max-w-md leading-relaxed text-ink-soft">{t.signedOutBody}</p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <LinkButton href="/sign-up" size="lg">{t.createAccount}</LinkButton>
          <LinkButton href="/sign-in?redirect_url=/profile" variant="secondary" size="lg">{t.haveAccount}</LinkButton>
        </div>
      </div>
    );
  }

  // Remount when the profile first arrives so the form picks it up.
  return <ProfileForm key={profile ? "edit" : "new"} />;
}

function ProfileForm() {
  const dict = useDict();
  const t = dict.profile;
  const router = useRouter();
  const { profile, setProfile, refreshApplications, pendingInterest } = useSite();
  const isNew = !profile;

  const [form, setForm] = useState<FormState>(() => toForm(profile, pendingInterest));
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const set = (key: Key) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const digitsOnly = key === "mobile" || key === "altMobile" || key === "aadhaarLast4";
    setForm((f) => ({ ...f, [key]: digitsOnly ? e.target.value.replace(/\D/g, "") : e.target.value }));
    setSaved(false);
  };

  const validate = (keys: Key[]): string => {
    if (keys.some((k) => !OPTIONAL.includes(k) && !form[k].trim())) return t.errRequired;
    if (keys.includes("mobile") && !/^\d{10}$/.test(form.mobile)) return t.errMobile;
    if (keys.includes("aadhaarLast4") && !/^\d{4}$/.test(form.aadhaarLast4)) return t.errAadhaar;
    return "";
  };

  const showError = (message: string) => {
    setError(message);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = () => {
    const message = validate(STEPS[step]);
    if (message) return showError(message);
    setError("");
    setStep((s) => s + 1);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew && step < STEPS.length - 1) return next();

    const message = validate(STEPS.flat());
    if (message) return showError(message);

    setError("");
    setSaving(true);
    const resumeName = file?.name ?? profile?.resumeName ?? "my_resume.pdf";
    try {
      const body = new FormData();
      for (const [key, value] of Object.entries(form)) body.append(key, value);
      body.append("resumeName", resumeName);
      if (file) body.append("resume", file);

      const response = await fetch("/api/profile", { method: "POST", body });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? t.failed);
      }
      const data = (await response.json()) as { profile?: PublicUserProfile };
      setProfile(data.profile ?? { ...form, resumeName });
      setFile(null);
      await refreshApplications();
      if (isNew) {
        router.push("/jobs");
      } else {
        setSaved(true);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t.failed);
    } finally {
      setSaving(false);
    }
  };

  const sectionTitles = [t.sections.personal, t.sections.work, t.sections.resume];
  const visible = (i: number) => !isNew || step === i;

  const text = (key: Key, props: React.ComponentProps<typeof Input> = {}) => (
    <Field
      label={t.fields[key]}
      htmlFor={`p-${key}`}
      required={!OPTIONAL.includes(key)}
      optional={OPTIONAL.includes(key) ? t.optional : undefined}
    >
      <Input
        id={`p-${key}`}
        value={form[key]}
        onChange={set(key)}
        placeholder={(t.placeholders as Partial<Record<Key, string>>)[key]}
        {...props}
      />
    </Field>
  );

  const districts = form.district && !DISTRICTS.includes(form.district) ? [form.district, ...DISTRICTS] : DISTRICTS;

  return (
    <form onSubmit={submit} noValidate>
      <div ref={topRef} className="scroll-mt-24" />

      {isNew && (
        <div className="mb-8">
          <p className="num text-sm text-ink-mute">{t.stepOf(step + 1, STEPS.length)}</p>
          <ol className="mt-3 grid grid-cols-3 gap-2">
            {sectionTitles.map((title, i) => (
              <li key={title} className="flex flex-col gap-2">
                <span className={`h-1 rounded-full transition-colors ${i <= step ? "bg-accent" : "bg-line"}`} />
                <span className={`text-sm ${i === step ? "text-ink" : "text-ink-mute"}`}>{title}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {error && <div className="mb-6"><FormMessage tone="error">{error}</FormMessage></div>}
      {saved && <div className="mb-6"><FormMessage tone="success">{t.saved}</FormMessage></div>}

      <div className="space-y-10">
        {visible(0) && (
          <fieldset className="animate-rise">
            <legend className="float-left w-full font-display text-2xl">{t.sections.personal}</legend>
            <div className="clear-both mt-5 grid gap-5 sm:grid-cols-2">
              {text("name", { autoComplete: "name" })}
              {text("fatherName")}
              {text("mobile", { inputMode: "numeric", maxLength: 10, autoComplete: "tel-national", className: "num" })}
              {text("altMobile", { inputMode: "numeric", maxLength: 10, className: "num" })}
              <Field label={t.fields.address} htmlFor="p-address" required className="sm:col-span-2">
                <Textarea id="p-address" rows={2} value={form.address} onChange={set("address")} placeholder={t.placeholders.address} className="min-h-0" />
              </Field>
              <Field label={t.fields.district} htmlFor="p-district" required>
                <Select id="p-district" value={form.district} onChange={set("district")}>
                  <option value="">{t.select}</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
              <Field label={t.fields.aadhaarLast4} htmlFor="p-aadhaarLast4" required hint={t.aadhaarNote}>
                <Input id="p-aadhaarLast4" inputMode="numeric" maxLength={4} value={form.aadhaarLast4} onChange={set("aadhaarLast4")} placeholder={t.placeholders.aadhaarLast4} className="num tracking-[0.3em]" />
              </Field>
            </div>
          </fieldset>
        )}

        {visible(1) && (
          <fieldset className={`animate-rise ${isNew ? "" : "border-t border-line pt-10"}`}>
            <legend className="float-left w-full font-display text-2xl">{t.sections.work}</legend>
            <div className="clear-both mt-5 grid gap-5 sm:grid-cols-2">
              <Field label={t.fields.qualification} htmlFor="p-qualification" required>
                <Select id="p-qualification" value={form.qualification} onChange={set("qualification")}>
                  <option value="">{t.select}</option>
                  {QUALIFICATIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                  {form.qualification && !QUALIFICATIONS.some((q) => q.value === form.qualification) && (
                    <option value={form.qualification}>{form.qualification}</option>
                  )}
                </Select>
              </Field>
              <Field label={t.fields.experience} htmlFor="p-experience" required>
                <Select id="p-experience" value={form.experience} onChange={set("experience")}>
                  <option value="">{t.select}</option>
                  {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
                  {form.experience && !EXPERIENCE.includes(form.experience) && (
                    <option value={form.experience}>{form.experience}</option>
                  )}
                </Select>
              </Field>
              {text("skills")}
              {text("interestedJob")}
            </div>
          </fieldset>
        )}

        {visible(2) && (
          <fieldset className={`animate-rise ${isNew ? "" : "border-t border-line pt-10"}`}>
            <legend className="float-left w-full font-display text-2xl">{t.sections.resume} <span className="font-sans text-base text-ink-mute">({t.optional})</span></legend>
            <div className="clear-both mt-5">
              {profile?.resumeName && !file && (
                <p className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
                  <FileIcon size={16} className="text-ink-mute" /> {t.resumeCurrent}: <span className="font-medium text-ink">{profile.resumeName}</span>
                </p>
              )}
              <label
                htmlFor="p-resume"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center transition-colors hover:border-accent hover:bg-accent-soft/40 focus-within:border-accent"
              >
                {file ? (
                  <>
                    <CheckIcon className="text-accent" size={22} />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-ink-mute">{t.resumeReplace}</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="text-ink-mute" size={22} />
                    <span className="font-medium">{profile?.resumeName ? t.resumeReplace : t.resumeDrop}</span>
                    <span className="text-sm text-ink-mute">{t.resumeTypes}</span>
                  </>
                )}
                <input
                  id="p-resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </fieldset>
        )}
      </div>

      <div className="mt-10 flex flex-col-reverse gap-2 border-t border-line pt-6 sm:flex-row sm:justify-between">
        {isNew && step > 0 ? (
          <Button variant="ghost" onClick={() => { setError(""); setStep((s) => s - 1); }}>{t.back}</Button>
        ) : <span />}
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? t.saving : isNew ? (step < STEPS.length - 1 ? t.next : t.saveNew) : t.save}
        </Button>
      </div>
    </form>
  );
}
