import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

/** True if this Clerk user has already filled in their job-seeker profile. */
export async function hasCandidateProfile(clerkUserId: string): Promise<boolean> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("candidates")
    .select("id")
    .eq("source", "public_job_seeker")
    .eq("created_by_clerk_user_id", clerkUserId)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data !== null;
}
