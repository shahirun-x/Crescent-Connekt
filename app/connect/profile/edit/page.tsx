import { redirect } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ProfileForm, { type ProfileDraft } from "@/components/connect/ProfileForm";
import { getMemberSession } from "@/lib/connect-auth";

export const metadata: Metadata = {
  title: "Edit your profile",
  robots: "noindex, nofollow",
};

export default async function ConnectProfileEditPage() {
  const session = await getMemberSession();
  if (!session) redirect("/connect/login");
  if (!session.profile) redirect("/connect/setup");

  const p = session.profile;

  const initial: ProfileDraft = {
    full_name: p.full_name,
    role: p.role,
    institution_id: p.institution_id,
    batch_year: p.batch_year ? String(p.batch_year) : "",
    current_city: p.current_city ?? "",
    current_country: p.current_country ?? "India",
    headline: p.headline ?? "",
    bio: p.bio ?? "",
    avatar_url: p.avatar_url,
    linkedin_url: p.linkedin_url ?? "",
    phone: p.phone ?? "",
    show_email: p.show_email,
    show_phone: p.show_phone,
  };

  // Editing never re-triggers approval — an approved member stays approved and
  // goes straight back to their profile.
  const redirectTo =
    p.status === "approved" ? `/connect/profile/${p.id}` : "/connect/pending";

  return (
    <>
      <PageHeader
        eyebrow="Crescent Connect"
        title="Edit your profile"
        description="Update your details any time. Changing your name or institution does not restart the review."
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-2xl rounded-card border border-slate-200 bg-white p-6 sm:p-8">
          <ProfileForm mode="edit" redirectTo={redirectTo} initial={initial} />
        </div>
      </div>
    </>
  );
}
