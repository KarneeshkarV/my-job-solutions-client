import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { hasCandidateProfile } from "@/lib/candidates";

/**
 * Clerk sends people here after sign-in and sign-up.
 * First time (no profile yet) → the profile cards. Returning → jobs.
 */
export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let hasProfile = false;
  try {
    hasProfile = await hasCandidateProfile(userId);
  } catch (error) {
    // If the check fails, the profile page loads the profile itself.
    console.error("Profile check failed:", error);
  }

  redirect(hasProfile ? "/jobs" : "/profile");
}
