import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { Avatar } from "@/components/connect/MemberCard";
import { getMemberSession } from "@/lib/connect-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { roleMeta, type MemberRole } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Member profile",
  robots: "noindex, nofollow",
};

interface DetailRow {
  id: string;
  full_name: string;
  role: MemberRole;
  institution_name: string | null;
  batch_year: number | null;
  current_city: string | null;
  current_country: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  phone: string | null;
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getMemberSession();
  if (!session) redirect("/connect/login");
  if (!session.profile) redirect("/connect/setup");
  if (session.profile.status === "pending") redirect("/connect/pending");
  if (session.profile.status !== "approved") redirect("/connect/status");

  const { id } = await params;
  const isSelf = id === session.profile.id;

  const supabase = getServiceSupabase();
  if (!supabase) notFound();

  // Read from the consent-masked view, so email and phone are already nulled
  // unless that member chose to share them. Your own row is read from the same
  // view for consistency; your real contact details are always on your edit page.
  const { data, error } = await supabase
    .from("directory_profiles")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) notFound();
  const m = data as DetailRow;
  const meta = roleMeta[m.role];
  const location = [m.current_city, m.current_country].filter(Boolean).join(", ");

  return (
    <>
      <PageHeader
        eyebrow="Crescent Connect"
        title={m.full_name}
        description={m.headline ?? undefined}
      />

      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/connect/directory"
            className="text-sm font-semibold text-crescent-600 hover:text-crescent-800"
          >
            ← Back to directory
          </Link>

          <div className="mt-5 rounded-card border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
              <Avatar src={m.avatar_url} name={m.full_name} size={112} />

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-crescent-800">
                  {m.full_name}
                </h1>

                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
                  >
                    {meta.label}
                  </span>
                  {m.batch_year && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      Batch of {m.batch_year}
                    </span>
                  )}
                </div>

                {m.headline && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {m.headline}
                  </p>
                )}

                {isSelf && (
                  <Link
                    href="/connect/profile/edit"
                    className="mt-4 inline-block rounded-full bg-crescent-700 px-5 py-2 text-sm font-semibold text-white hover:bg-crescent-800"
                  >
                    This is you — edit profile
                  </Link>
                )}
              </div>
            </div>

            <dl className="mt-7 grid gap-x-8 gap-y-4 border-t border-slate-100 pt-6 text-sm sm:grid-cols-2">
              {m.institution_name && (
                <Row label="Institution">{m.institution_name}</Row>
              )}
              {location && <Row label="Location">{location}</Row>}
              {m.email && (
                <Row label="Email">
                  <a
                    href={`mailto:${m.email}`}
                    className="text-crescent-700 hover:underline"
                  >
                    {m.email}
                  </a>
                </Row>
              )}
              {m.phone && (
                <Row label="Phone">
                  <a
                    href={`tel:${m.phone}`}
                    className="text-crescent-700 hover:underline"
                  >
                    {m.phone}
                  </a>
                </Row>
              )}
              {m.linkedin_url && (
                <Row label="LinkedIn">
                  <a
                    href={m.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-crescent-700 hover:underline"
                  >
                    View profile ↗
                  </a>
                </Row>
              )}
            </dl>

            {m.bio && (
              <div className="mt-7 border-t border-slate-100 pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  About
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {m.bio}
                </p>
              </div>
            )}

            {!m.email && !m.phone && !m.linkedin_url && !isSelf && (
              <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
                This member has chosen to keep their contact details private.
              </p>
            )}
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
