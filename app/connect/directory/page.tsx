import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import DirectoryBrowser from "@/components/connect/DirectoryBrowser";
import { getMemberSession } from "@/lib/connect-auth";

export const metadata: Metadata = {
  title: "Member Directory",
  robots: "noindex, nofollow",
};

export default async function ConnectDirectoryPage() {
  const session = await getMemberSession();
  if (!session) redirect("/connect/login");
  if (!session.profile) redirect("/connect/setup");
  if (session.profile.status === "pending") redirect("/connect/pending");
  if (session.profile.status !== "approved") redirect("/connect/status");

  return (
    <>
      <PageHeader
        eyebrow="Crescent Connect"
        title="Member Directory"
        description="Students, alumni, faculty, management, parents, entrepreneurs and well-wishers from across the Crescent network."
      />

      <div className="container-page py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-crescent-200 bg-crescent-50/60 px-5 py-3">
          <p className="text-sm text-crescent-800">
            Signed in as <strong>{session.profile.full_name}</strong>
          </p>
          <div className="flex gap-2">
            <Link
              href={`/connect/profile/${session.profile.id}`}
              className="rounded-full border border-crescent-300 bg-white px-4 py-1.5 text-xs font-semibold text-crescent-700 hover:bg-crescent-50"
            >
              My profile
            </Link>
            <Link
              href="/connect/profile/edit"
              className="rounded-full border border-crescent-300 bg-white px-4 py-1.5 text-xs font-semibold text-crescent-700 hover:bg-crescent-50"
            >
              Edit
            </Link>
          </div>
        </div>

        <DirectoryBrowser />
      </div>
    </>
  );
}
