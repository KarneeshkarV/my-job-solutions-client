import { redirect } from "next/navigation";

/**
 * Clerk fallback redirect target after sign-in / sign-up.
 * Sends users to their profile.
 */
export default function DashboardPage() {
  redirect("/profile");
}
