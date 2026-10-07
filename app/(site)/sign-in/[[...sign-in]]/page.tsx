import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/site/auth-shell";
import { getDict } from "@/lib/i18n-server";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  const t = await getDict();
  return (
    <AuthShell title={t.auth.signInTitle} body={t.auth.signInBody}>
      <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
    </AuthShell>
  );
}
