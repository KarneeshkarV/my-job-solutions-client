// Small line-icon set. 20px grid, 1.6 stroke, inherits colour.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="9" cy="9" r="5.5" /><path d="m13.2 13.2 3.8 3.8" /></svg>
);
export const PinIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M10 17.5s5.5-5 5.5-9.5a5.5 5.5 0 0 0-11 0c0 4.5 5.5 9.5 5.5 9.5Z" /><circle cx="10" cy="8" r="2" /></svg>
);
export const BriefcaseIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="2.5" y="6" width="15" height="10.5" rx="1.5" /><path d="M7 6V4.5A1 1 0 0 1 8 3.5h4a1 1 0 0 1 1 1V6M2.5 10.5h15" /></svg>
);
export const UsersIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="7.5" cy="7" r="2.75" /><path d="M2.5 16c.4-2.6 2.5-4.3 5-4.3s4.6 1.7 5 4.3" /><path d="M13 4.6a2.6 2.6 0 0 1 0 4.9M14.5 11.9c1.6.5 2.7 1.9 3 4.1" /></svg>
);
export const ShieldCheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M10 2.5 3.5 5v5c0 4 3 6.5 6.5 7.5 3.5-1 6.5-3.5 6.5-7.5V5L10 2.5Z" /><path d="m7 10 2 2 4-4" /></svg>
);
export const GradCapIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M2.5 7.5 10 4l7.5 3.5L10 11 2.5 7.5Z" /><path d="M5.5 9v4c0 1.3 2 2.5 4.5 2.5s4.5-1.2 4.5-2.5V9" /></svg>
);
export const WrenchIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5.5a3.5 3.5 0 0 0-4.4 4.4L3 14.5 5.5 17l4.6-4.6a3.5 3.5 0 0 0 4.4-4.4l-2 2-2.5-2.5 2-2Z" /></svg>
);
export const MonitorIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="2.5" y="3.5" width="15" height="10" rx="1.5" /><path d="M7 17h6M10 13.5V17" /></svg>
);
export const StarIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M10 2.8 12 7.5l5 .5-3.8 3.3 1.1 4.9L10 13.7l-4.3 2.5 1.1-4.9L3 8l5-.5 2-4.7Z" /></svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5" /></svg>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" /></svg>
);
export const PhoneIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4.5 3h2.6l1.3 3.4-1.7 1.1a8.5 8.5 0 0 0 5.8 5.8l1.1-1.7 3.4 1.3v2.6a1.5 1.5 0 0 1-1.5 1.5A13.5 13.5 0 0 1 3 4.5 1.5 1.5 0 0 1 4.5 3Z" /></svg>
);
export const MailIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="2.5" y="4.5" width="15" height="11" rx="1.5" /><path d="m3 5.5 7 5.5 7-5.5" /></svg>
);
export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="10" cy="10" r="7.5" /><path d="M10 5.5V10l3 2" /></svg>
);
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m4.5 10.5 3.5 3.5 7.5-8" /></svg>
);
export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m5 5 10 10M15 5 5 15" /></svg>
);
export const MenuIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 6.5h14M3 13.5h14" /></svg>
);
export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M10 4v12M4 10h12" /></svg>
);
export const FilterIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 5.5h14M5.5 10h9M8 14.5h4" /></svg>
);
export const UploadIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M10 13V3.5M6 7.5l4-4 4 4M3.5 13v2a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-2" /></svg>
);
export const FileIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M11.5 2.5H6A1.5 1.5 0 0 0 4.5 4v12A1.5 1.5 0 0 0 6 17.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5l-4-4Z" /><path d="M11.5 2.5v4h4" /></svg>
);
export const SendIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m17.5 2.5-7 15-2.5-6.5-6.5-2.5 16-6Z" /><path d="m17.5 2.5-9.5 8.5" /></svg>
);

/** WhatsApp glyph, filled. */
export const WhatsAppIcon = ({ size = 18, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);
