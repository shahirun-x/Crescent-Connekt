import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { getMemberSession } from "@/lib/connect-auth";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Membership status",
  robots: "noindex, nofollow",
};

export default async function ConnectStatusPage() {
  const session = await getMemberSession();
  if (!session) redirect("/connect/login");
  if (!session.profile) redirect("/connect/setup");

  const { status, rejection_reason } = session.profile;
  if (status === "approved") redirect("/connect/directory");
  if (status === "pending") redirect("/connect/pending");

  const suspended = status === "suspended";

  return (
    <>
      <PageHeader
        eyebrow="Crescent Connect"
        title={suspended ? "Your membership is suspended" : "Your profile wasn't approved"}
        description={
          suspended
            ? "Your access to the member directory is currently paused."
            : "After review, we weren't able to approve this profile for the directory."
        }
      />

      <div className="container-page py-12">
        <div className="mx-auto max-w-xl">
          <div className="rounded-card border border-slate-200 bg-white p-6 sm:p-7">
            {rejection_reason ? (
              <>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Reason given
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {rejection_reason}
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-slate-600">
                No specific reason was recorded. If you think this was a mistake,
                please get in touch — we&apos;re happy to take another look.
              </p>
            )}

            <div className="mt-6 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-600">
              <p>
                If you believe this is an error, or your circumstances have
                changed, contact the Crescent Global team at{" "}
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="font-semibold text-crescent-700 hover:underline"
                >
                  {site.contactEmail}
                </a>
                .
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-crescent-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crescent-800"
            >
              Contact us
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Back to site
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
