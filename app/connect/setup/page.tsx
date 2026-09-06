import { redirect } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ProfileForm, { EMPTY_DRAFT } from "@/components/connect/ProfileForm";
import { getMemberSession, routeForProfile } from "@/lib/connect-auth";

export const metadata: Metadata = {
  title: "Set up your profile",
  robots: "noindex, nofollow",
};

export default async function ConnectSetupPage() {
  const session = await getMemberSession();
  if (!session) redirect("/connect/login");

  // Already has a profile — send them wherever they belong.
  if (session.profile) redirect(routeForProfile(session.profile));

  return (
    <>
      <PageHeader
        eyebrow="Crescent Connect"
        title="Set up your profile"
        description="Tell us who you are. Profiles are reviewed by the Crescent Global team before they join the member directory."
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-2xl rounded-card border border-slate-200 bg-white p-6 sm:p-8">
          <ProfileForm
            mode="create"
            redirectTo="/connect/pending"
            initial={EMPTY_DRAFT}
          />
        </div>
      </div>
    </>
  );
}
