import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, Mukta } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { LangProvider } from "@/components/i18n-provider";
import { getLang } from "@/lib/i18n-server";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  variable: "--font-fraunces",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mukta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MyJobSolution — Verified jobs in eastern Uttar Pradesh",
    template: "%s · MyJobSolution",
  },
  description:
    "Recruitment and manpower consultancy in Khalilabad, Sant Kabir Nagar. Verified jobs, free for job seekers. Register once and our team calls you.",
};

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#1f5c3a",
    colorBackground: "#ffffff",
    colorForeground: "#0e1a2b",
    colorInput: "#ffffff",
    colorInputForeground: "#0e1a2b",
    colorMutedForeground: "#6b7180",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-hanken), var(--font-mukta), system-ui, sans-serif",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang={lang} className={`${fraunces.variable} ${hanken.variable} ${mukta.variable} h-full antialiased`}>
        <body className="flex min-h-full flex-col">
          <LangProvider lang={lang}>{children}</LangProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
