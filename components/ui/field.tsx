import type { ComponentProps, ReactNode } from "react";

const control =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-mute/80 " +
  "transition-colors duration-150 hover:border-ink-mute focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15 " +
  "disabled:bg-paper-sunk disabled:text-ink-mute";

type FieldProps = {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  optional?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, hint, optional, required, className = "", children }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="text-signal" aria-hidden> *</span>}
        {optional && <span className="font-normal text-ink-mute"> ({optional})</span>}
      </label>
      {children}
      {hint && <p className="text-[13px] leading-snug text-ink-mute">{hint}</p>}
    </div>
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${control} h-11 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${control} min-h-28 py-2.5 leading-relaxed ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={`${control} h-11 appearance-none pr-9 ${className}`} {...props}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute"
        width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden
      >
        <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const styles =
    tone === "error"
      ? "border-signal/25 bg-signal-soft text-signal"
      : "border-accent/25 bg-accent-soft text-accent-hover";
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles}`}>
      {children}
    </p>
  );
}
