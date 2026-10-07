import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp" | "inverse";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover disabled:bg-ink-mute",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-ink hover:bg-paper",
  ghost:
    "text-ink hover:bg-paper-sunk",
  whatsapp:
    "bg-[#1f7a4d] text-white hover:bg-[#186540]",
  inverse:
    "border border-paper/25 text-paper hover:bg-paper/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-6 text-base gap-2.5",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return [
    "inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap",
    "transition-colors duration-150 cursor-pointer select-none",
    "disabled:cursor-not-allowed disabled:opacity-70",
    variants[variant],
    sizes[size],
    extra,
  ].join(" ");
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function LinkButton({ variant, size, className = "", ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

type AnchorButtonProps = ComponentProps<"a"> & { variant?: Variant; size?: Size };

/** For external links (WhatsApp, tel:, maps). */
export function AnchorButton({ variant, size, className = "", ...props }: AnchorButtonProps) {
  return <a className={buttonClass(variant, size, className)} {...props} />;
}
