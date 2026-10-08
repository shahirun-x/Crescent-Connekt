import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import DirectoryBrowser from "@/components/connect/DirectoryBrowser";
import MemberNav from "@/components/connect/MemberNav";
import { getMemberSession } from "@/lib/connect-auth";

export const metadata: Metadata = {
  title: "Member Directory",
  robots: "noindex, nofollow",
};

export default async function ConnectDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ institution?: string }>;
}) {
  const session = await getMemberSession();
  if (!session) redirect("/connect/login");
  if (!session.profile) redirect("/connect/setup");
  if (session.profile.status === "pending") redirect("/connect/pending");
  if (session.profile.status !== "approved") redirect("/connect/status");

  // Seeds the filter only. The value goes to the directory API as a query
  // parameter, where it is matched with .eq() — never interpolated — so an
  // arbitrary string can at worst return no results.
  const { institution } = await searchParams;
  const initialInstitution =
    typeof institution === "string" && /^[a-z0-9-]{1,80}$/i.test(institution)
      ? institution
      : "";

  return (
    <>
      <PageHeader
        eyebrow="Member Network"
        title="Member Directory"
        description="Students, alumni, faculty, management, parents, entrepreneurs and well-wishers from across the Crescent network."
      />

      <div className="container-page py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <MemberNav current="directory" profileId={session.profile.id} />
          <p className="text-sm text-ink-700">
            Signed in as <strong>{session.profile.full_name}</strong> ·{" "}
            <Link
              href="/connect/profile/edit"
              className="inline-flex min-h-[2.75rem] items-center underline underline-offset-4 hover:text-accent-700"
            >
              Edit profile
            </Link>
          </p>
        </div>

        <DirectoryBrowser initialInstitution={initialInstitution} />
      </div>
    </>
  );
}
