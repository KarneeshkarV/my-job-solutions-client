import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  parseExperienceYears,
  parseSkills,
  toPublicProfile,
} from "@/lib/public-api";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
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
});

async function requireUserId() {
  const session = await auth();
  if (!session.userId) {
    return null;
  }
  return session.userId;
}

async function getExistingCandidate(userId: string) {
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

  const candidate = await getExistingCandidate(userId);
  if (!candidate) {
    return NextResponse.json({ profile: null });
  }

  const resumeName = await getLatestResumeName(candidate.id);
  return NextResponse.json({
    profile: toPublicProfile(candidate, resumeName),
  });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown;
  let resumeFile: File | null = null;
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("resume");
    if (file instanceof File && file.size > 0) {
      resumeFile = file;
    }
    body = Object.fromEntries(formData);
  } else {
    body = await request.json();
  }
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid profile" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceRoleClient();
  const existing = await getExistingCandidate(userId);
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const payload = {
    full_name: parsed.data.name,
    email,
    phone: parsed.data.mobile,
    alternate_phone: parsed.data.altMobile || null,
    location: parsed.data.district,
    current_role: parsed.data.interestedJob,
    desired_role: parsed.data.interestedJob,
    experience_years: parseExperienceYears(parsed.data.experience),
    skills: parseSkills(parsed.data.skills),
    employment_type: parsed.data.experience.toLowerCase().includes("fresh")
      ? "Fresher"
      : "Experienced",
    highest_qualification: parsed.data.qualification,
    father_name: parsed.data.fatherName,
    address: parsed.data.address,
    district: parsed.data.district,
    aadhaar_last4: parsed.data.aadhaarLast4,
    updated_by_clerk_user_id: userId,
  };
  // Set only when the candidate is created. On later updates the CRM team
  // owns status (pipeline stage) and notes, so they must not be overwritten.
  const createOnly = {
    notes: `Public client profile. Address: ${parsed.data.address}`,
    source: "public_job_seeker",
    status: "new_lead",
  };

  const result = existing
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
          ...createOnly,
          created_by_clerk_user_id: userId,
        })
        .select("id")
        .single();

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  await supabase.from("candidate_activity").insert({
    candidate_id: result.data.id,
    actor_clerk_user_id: userId,
    activity_type: existing ? "public_profile_updated" : "public_profile_created",
    body: existing
      ? "Candidate updated their public profile."
      : "Candidate created their public profile.",
  });

  if (resumeFile) {
    const safeName = resumeFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${result.data.id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("candidate-documents")
      .upload(storagePath, resumeFile, {
        contentType: resumeFile.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { error: documentError } = await supabase
      .from("candidate_documents")
      .insert({
        candidate_id: result.data.id,
        file_name: resumeFile.name,
        file_type: resumeFile.type || "application/octet-stream",
        file_size: resumeFile.size,
        storage_path: storagePath,
        uploaded_by_clerk_user_id: userId,
      });

    if (documentError) {
      return NextResponse.json({ error: documentError.message }, { status: 500 });
    }

    await supabase.from("candidate_activity").insert({
      candidate_id: result.data.id,
      actor_clerk_user_id: userId,
      activity_type: "document_uploaded",
      body: `Uploaded ${resumeFile.name}.`,
    });
  }

  const resumeName = parsed.data.resumeName || (await getLatestResumeName(result.data.id));
  return NextResponse.json({
    profile: toPublicProfile(
      {
        ...payload,
        full_name: parsed.data.name,
      },
      resumeName,
    ),
  });
}
