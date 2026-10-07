"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";

import type { PublicApplication, PublicUserProfile } from "@/lib/public-api";
import type { Job } from "@/lib/job-utils";
import { ApplyDialog } from "./apply-dialog";

type SiteState = {
  authLoaded: boolean;
  isSignedIn: boolean;
  /** True once the profile request has finished (or the user is signed out). */
  profileLoaded: boolean;
  profile: PublicUserProfile | null;
  setProfile: (profile: PublicUserProfile) => void;
  applications: PublicApplication[];
  /** Jobs referenced by the user's applications, including closed ones. */
  applicationJobs: Job[];
  hasApplied: (jobId: string) => boolean;
  refreshApplications: () => Promise<void>;
  /** Job title picked before the profile existed; pre-fills the form. */
  pendingInterest: string;
  startApply: (job: Job) => void;
  signOut: () => void;
};

const SiteContext = createContext<SiteState | null>(null);

export function useSite(): SiteState {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}

type ApplicationsResponse = { applications?: PublicApplication[]; jobs?: Job[] };

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoaded, isSignedIn: clerkSignedIn } = useAuth();
  const { signOut: clerkSignOut } = useClerk();
  const isSignedIn = !!clerkSignedIn;

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [applications, setApplications] = useState<PublicApplication[]>([]);
  const [applicationJobs, setApplicationJobs] = useState<Job[]>([]);
  const [pendingInterest, setPendingInterest] = useState("");
  const [reviewJob, setReviewJob] = useState<Job | null>(null);

  const applyApplications = useCallback((data: ApplicationsResponse) => {
    setApplications(data.applications ?? []);
    setApplicationJobs(data.jobs ?? []);
  }, []);

  const refreshApplications = useCallback(async () => {
    const response = await fetch("/api/applications");
    if (!response.ok) return;
    applyApplications((await response.json()) as ApplicationsResponse);
  }, [applyApplications]);

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    async function load() {
      if (!isSignedIn) {
        setProfile(null);
        setApplications([]);
        setApplicationJobs([]);
        setProfileLoaded(true);
        return;
      }

      setProfileLoaded(false);
      const [profileRes, appsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/applications"),
      ]);
      if (cancelled) return;

      if (profileRes.ok) {
        const data = (await profileRes.json()) as { profile?: PublicUserProfile | null };
        if (!cancelled) setProfile(data.profile ?? null);
      }
      if (appsRes.ok) {
        const data = (await appsRes.json()) as ApplicationsResponse;
        if (!cancelled) applyApplications(data);
      }
      if (!cancelled) setProfileLoaded(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, applyApplications]);

  const hasApplied = useCallback(
    (jobId: string) => applications.some((a) => a.jobId === jobId),
    [applications],
  );

  const startApply = useCallback(
    (job: Job) => {
      if (!isSignedIn) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(`/jobs/${job.id}`)}`);
        return;
      }
      if (!profile) {
        setPendingInterest(job.title);
        router.push("/profile");
        return;
      }
      if (hasApplied(job.id)) return;
      setReviewJob(job);
    },
    [isSignedIn, profile, hasApplied, router],
  );

  const signOut = useCallback(() => {
    setProfile(null);
    setApplications([]);
    setApplicationJobs([]);
    void clerkSignOut({ redirectUrl: "/" });
  }, [clerkSignOut]);

  const value = useMemo<SiteState>(
    () => ({
      authLoaded: isLoaded,
      isSignedIn,
      profileLoaded,
      profile,
      setProfile,
      applications,
      applicationJobs,
      hasApplied,
      refreshApplications,
      pendingInterest,
      startApply,
      signOut,
    }),
    [isLoaded, isSignedIn, profileLoaded, profile, applications, applicationJobs, hasApplied, refreshApplications, pendingInterest, startApply, signOut],
  );

  return (
    <SiteContext.Provider value={value}>
      {children}
      {reviewJob && profile && (
        <ApplyDialog
          job={reviewJob}
          profile={profile}
          onClose={() => setReviewJob(null)}
          onSubmitted={async (submitted) => {
            setProfile(submitted);
            await refreshApplications();
            setReviewJob(null);
            router.push("/applied");
          }}
        />
      )}
    </SiteContext.Provider>
  );
}
