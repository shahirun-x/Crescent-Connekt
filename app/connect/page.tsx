import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { getMemberSession } from "@/lib/connect-auth";
import { MEMBER_ROLES, roleMeta } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Crescent Connect",
  description:
    "A secure, members-only network linking students, alumni, faculty, management, parents, entrepreneurs and well-wishers across the Crescent ecosystem.",
  alternates: { canonical: "/connect" },
};

const groups: Record<(typeof MEMBER_ROLES)[number], string> = {
  student: "Find mentors, internships and events across every campus.",
  alumni: "Reconnect, form chapters, mentor students and hire from the network.",
  faculty: "Collaborate on research, curriculum and shared programmes.",
  management: "Coordinate strategy and resources across institutions.",
  parent: "Stay informed and involved in the wider Crescent community.",
  entrepreneur: "Partner with CIIC, recruit talent and back student ventures.",
  wellwisher: "Support scholarships, welfare and outreach initiatives.",
};

export default async function ConnectPage() {
  const session = await getMemberSession();
  const approved = session?.profile?.status === "approved";
  const pending = session?.profile?.status === "pending";
  const needsSetup = !!session && !session.profile;

  return (
    <>
      <PageHeader
        eyebrow="The People Layer"
        title="Crescent Connect"
        description="A single, secure network where the whole Crescent family can find and help one another — students, alumni, faculty, management, parents, entrepreneurs and well-wishers."
      />

      <div className="container-page py-14">
        {/* CTA panel */}
        <div className="rounded-card border border-crescent-200 bg-crescent-50 p-6 sm:p-8">
          {approved ? (
            <>
              <h2 className="text-lg font-semibold text-crescent-800">
                Welcome back, {session!.profile!.full_name.split(" ")[0]}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                You&apos;re an approved member. Browse the directory to find and
                connect with people across the network.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/connect/directory"
                  className="rounded-full bg-crescent-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crescent-800"
                >
                  Go to Directory →
                </Link>
                <Link
                  href={`/connect/profile/${session!.profile!.id}`}
                  className="rounded-full border border-crescent-300 bg-white px-6 py-3 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
                >
                  My profile
                </Link>
              </div>
            </>
          ) : pending ? (
            <>
              <h2 className="text-lg font-semibold text-crescent-800">
                Your profile is under review
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Thanks for joining. We&apos;ll email you as soon as your profile
                is approved.
              </p>
              <div className="mt-5">
                <Link
                  href="/connect/pending"
                  className="rounded-full bg-crescent-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crescent-800"
                >
                  View my application
                </Link>
              </div>
            </>
          ) : needsSetup ? (
            <>
              <h2 className="text-lg font-semibold text-crescent-800">
                Finish setting up your profile
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Your account is ready. Tell us a little about yourself to join
                the directory.
              </p>
              <div className="mt-5">
                <Link
                  href="/connect/setup"
                  className="rounded-full bg-crescent-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crescent-800"
                >
                  Complete my profile →
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-crescent-800">
                Join the network
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Create your member profile to browse the Crescent directory and
                connect with the wider family. Every profile is reviewed before
                it joins the directory, so the network stays genuinely Crescent.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/connect/signup"
                  className="rounded-full bg-crescent-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crescent-800"
                >
                  Join Crescent Connect
                </Link>
                <Link
                  href="/connect/login"
                  className="rounded-full border border-crescent-300 bg-white px-6 py-3 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>

        <h2 className="mt-14 text-xl font-bold text-crescent-800">
          Who it&apos;s for
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBER_ROLES.map((r) => (
            <li
              key={r}
              className="rounded-card border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${roleMeta[r].dot}`} />
                <h3 className="text-base font-semibold text-crescent-800">
                  {roleMeta[r].label}
                </h3>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {groups[r]}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-14 rounded-card bg-slate-50 p-6 text-sm leading-relaxed text-slate-600">
          <h2 className="text-base font-semibold text-crescent-800">
            The vision
          </h2>
          <p className="mt-2">
            Every Crescent institution already has its own community. Crescent
            Connect links those communities without replacing them — a directory,
            a mentoring layer and a coordination space, with privacy and consent
            built in from the start. It is being developed under the Crescent
            Global Outreach Mission (CGOM).
          </p>
          <p className="mt-3">
            Your contact details stay hidden from other members unless you
            choose to share them, and the directory is never visible to the
            public web.
          </p>
        </div>
      </div>
    </>
  );
}
