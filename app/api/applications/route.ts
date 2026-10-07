import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  mapCandidateStatusToPublicStatus,
  parseExperienceYears,
  parseSkills,
  roleToPublicJob,
} from "@/lib/public-api";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const applySchema = z.object({
  roleId: z.uuid(),
  profile: z.object({
    name: z.string().trim().min(1),
    fatherName: z.string().trim().min(1),
    mobile: z.string().trim().regex(/^\d{10}$/),
    altMobile: z.string().trim().optional().or(z.literal("")),
    address: z.string().trim().min(1),
    district: z.string().trim().min(1),
    aadhaarLast4: z.string().trim().regex(/^\d{4}$/),
    qualification: z.string().trim().min(1),
    experience: z.string().trim().min(1),
    skills: z.string().trim().min(1),
    interestedJob: z.string().trim().min(1),
    resumeName: z.string().trim().optional().or(z.literal("")),
  }),
});

async function requireUserId() {
  const session = await auth();
  if (!session.userId) {
    return null;
  }
  return session.userId;
}

async function getCandidateForUser(userId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("source", "public_job_seeker")
    .eq("created_by_clerk_user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getLatestResumeName(candidateId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("candidate_documents")
    .select("file_name")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.file_name ?? "";
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidate = await getCandidateForUser(userId);
  if (!candidate) {
    return NextResponse.json({ applications: [], jobs: [] });
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("role_candidate_matches")
    .select(
      "id,role_id,status,created_at,company_roles(id,title,description,required_skills,location,vacancy_count,status,created_at,updated_at,companies(id,name,location,salary,fresher_experience,company_status))",
    )
    .eq("candidate_id", candidate.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const resumeName = await getLatestResumeName(candidate.id);
  const jobs = (data ?? [])
    .map((match) => match.company_roles)
    .filter(Boolean)
    .map((role) => roleToPublicJob(role));
  const applications = (data ?? []).map((match) => ({
    jobId: match.role_id,
    appliedAt: new Date(match.created_at).toISOString(),
    status: mapCandidateStatusToPublicStatus(candidate.status),
    resumeName,
  }));

  return NextResponse.json({ applications, jobs });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = applySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid application" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: role, error: roleError } = await supabase
    .from("company_roles")
    .select("id,title,status")
    .eq("id", parsed.data.roleId)
    .eq("status", "open")
    .maybeSingle();

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  if (!role) {
    return NextResponse.json({ error: "This job is no longer open." }, { status: 404 });
  }

  const existing = await getCandidateForUser(userId);
  const profile = parsed.data.profile;
  const payload = {
    full_name: profile.name,
    phone: profile.mobile,
    alternate_phone: profile.altMobile || null,
    location: profile.district,
    current_role: profile.interestedJob,
    desired_role: role.title || profile.interestedJob,
    experience_years: parseExperienceYears(profile.experience),
    skills: parseSkills(profile.skills),
    employment_type: profile.experience.toLowerCase().includes("fresh")
      ? "Fresher"
      : "Experienced",
    highest_qualification: profile.qualification,
    father_name: profile.fatherName,
    address: profile.address,
    district: profile.district,
    aadhaar_last4: profile.aadhaarLast4,
    notes: `Public client application. Address: ${profile.address}`,
    source: "public_job_seeker",
    status: "new_lead",
    updated_by_clerk_user_id: userId,
  };

  const candidateResult = existing
    ? await supabase
        .from("candidates")
        .update(payload)
        .eq("id", existing.id)
        .select("id")
        .single()
    : await supabase
        .from("candidates")
        .insert({
          ...payload,
          email: null,
          created_by_clerk_user_id: userId,
        })
        .select("id")
        .single();

  if (candidateResult.error) {
    return NextResponse.json(
      { error: candidateResult.error.message },
      { status: 500 },
    );
  }

  const candidateId = candidateResult.data.id;
  const { data: existingMatch, error: existingMatchError } = await supabase
    .from("role_candidate_matches")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("role_id", parsed.data.roleId)
    .maybeSingle();

  if (existingMatchError) {
    return NextResponse.json(
      { error: existingMatchError.message },
      { status: 500 },
    );
  }

  if (!existingMatch) {
    const { error: matchError } = await supabase
      .from("role_candidate_matches")
      .insert({
        candidate_id: candidateId,
        role_id: parsed.data.roleId,
        status: "submitted",
      });

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    await supabase.from("candidate_activity").insert({
      candidate_id: candidateId,
      actor_clerk_user_id: userId,
      activity_type: "public_application_submitted",
      body: `Candidate applied for ${role.title}.`,
      metadata: { role_id: parsed.data.roleId },
    });
  }

  return NextResponse.json({ ok: true });
}
