// Business contact details, shown in the header, footer, contact page and
// job pages. Change them here only.
export const SITE = {
  name: "MyJobSolution",
  phoneDisplay: "+91 99844 33339",
  phoneHref: "tel:+919984433339",
  whatsappNumber: "919984433339",
  email: "myjobsolution@gmail.com",
  telegram: "MyJobSolution",
  address: "Khalilabad, Sant Kabir Nagar, Uttar Pradesh",
  mapQuery: "Khalilabad, Sant Kabir Nagar, Uttar Pradesh",
} as const;

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
