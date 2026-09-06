import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { getMemberSession } from "@/lib/connect-auth";
import { roleMeta } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Profile under review",
  robots: "noindex, nofollow",
};

export default async function ConnectPendingPage() {
  const session = await getMemberSession();
  if (!session) redirect("/connect/login");
  if (!session.profile) redirect("/connect/setup");
  if (session.profile.status === "approved") redirect("/connect/directory");
  if (session.profile.status !== "pending") redirect("/connect/status");

  const p = session.profile;
  const meta = roleMeta[p.role];

  return (
    <>
      <PageHeader
        eyebrow="Crescent Connect"
        title="Your profile is under review"
        description="Thank you for joining. A member of the Crescent Global team will review your profile shortly."
      />

      <div className="container-page py-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3 rounded-card border border-amber-200 bg-amber-50 p-5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              ⏳
            </span>
            <div className="text-sm leading-relaxed text-amber-900">
              <p className="font-semibold">Awaiting approval</p>
              <p className="mt-1">
                We review every profile to keep the directory trusted and
                genuinely Crescent. You&apos;ll get an email at{" "}
                <strong>{session.user.email}</strong> as soon as you&apos;re
                approved — usually within a couple of days.
              </p>
              <p className="mt-2">
                You can keep editing your profile while you wait; changes
                won&apos;t restart the review.
              </p>
            </div>
          </div>

          <h2 className="mt-10 text-lg font-bold text-crescent-800">
            What you submitted
          </h2>

          <div className="mt-4 rounded-card border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                {p.avatar_url ? (
                  <Image
                    src={p.avatar_url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-500">
                    {p.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-crescent-800">
                  {p.full_name}
                </h3>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${meta.badge}`}
                >
                  {meta.label}
                </span>
                {p.headline && (
                  <p className="mt-2 text-sm text-slate-600">{p.headline}</p>
                )}
              </div>
            </div>

            <dl className="mt-6 grid gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2">
              <Row label="Location">
                {[p.current_city, p.current_country].filter(Boolean).join(", ") || "—"}
              </Row>
              {p.batch_year && <Row label="Batch">{p.batch_year}</Row>}
              <Row label="Email visible">{p.show_email ? "Yes" : "No"}</Row>
              <Row label="Phone visible">{p.show_phone ? "Yes" : "No"}</Row>
            </dl>

            {p.bio && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {p.bio}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/connect/profile/edit"
              className="rounded-full bg-crescent-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crescent-800"
            >
              Edit my profile
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-slate-700">{children}</dd>
    </div>
  );
}
