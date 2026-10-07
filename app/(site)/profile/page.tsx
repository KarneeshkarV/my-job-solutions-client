import type { Metadata } from "next";

import { ProfileHeading, ProfileSection } from "@/components/site/profile-form";

export const metadata: Metadata = { title: "Your profile" };

export default function ProfilePage() {
  return (
    <div className="wrap pb-24">
      <div className="max-w-3xl">
        <ProfileHeading />
        <ProfileSection />
      </div>
    </div>
  );
}
