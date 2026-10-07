import "server-only";

import { roleToPublicJob, type PublicJobOpening } from "@/lib/public-api";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

const ROLE_COLUMNS =
  "id,title,description,required_skills,location,vacancy_count,status,created_at,updated_at,companies(id,name,location,salary,fresher_experience,company_status)";

/** Open roles, newest first. Throws if Supabase fails. */
export async function fetchOpenJobs(): Promise<PublicJobOpening[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("company_roles")
    .select(ROLE_COLUMNS)
    .eq("status", "open")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((role) => roleToPublicJob(role));
}

/**
 * Same as fetchOpenJobs, but for pages: a data failure renders the empty
 * state instead of an error page.
 */
export async function getOpenJobs(): Promise<PublicJobOpening[]> {
  try {
    return await fetchOpenJobs();
  } catch (error) {
    console.error("Failed to load jobs:", error);
    return [];
  }
}

export async function getOpenJob(id: string): Promise<PublicJobOpening | null> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("company_roles")
      .select(ROLE_COLUMNS)
      .eq("id", id)
      .eq("status", "open")
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return roleToPublicJob(data);
  } catch (error) {
    console.error("Failed to load job:", error);
    return null;
  }
}
