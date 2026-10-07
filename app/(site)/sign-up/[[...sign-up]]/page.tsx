import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { AuthShell } from "@/components/site/auth-shell";
import { getDict } from "@/lib/i18n-server";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage() {
  const t = await getDict();
  return (
    <AuthShell title={t.auth.signUpTitle} body={t.auth.signUpBody}>
      <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
    </AuthShell>
  );
}
