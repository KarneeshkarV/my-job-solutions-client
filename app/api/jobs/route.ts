import { NextResponse } from "next/server";

import { fetchOpenJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ jobs: await fetchOpenJobs() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load jobs" },
      { status: 500 },
    );
  }
}
