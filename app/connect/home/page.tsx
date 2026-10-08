import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/connect/MemberCard";
import MemberNav from "@/components/connect/MemberNav";
import CopyInviteLink from "@/components/connect/CopyInviteLink";
import { getMemberDb } from "@/lib/member-db";
import {
  getInstitution,
  getNews,
  getOwnProfile,
  getPeople,
  getUpcomingEvents,
  profileCompleteness,
  todayInIndia,
  type HomeEvent,
  type HomeNews,
  type HomePerson,
} from "@/lib/member-home";
import { roleMeta } from "@/lib/roles";
import { SITE_URL } from "@/lib/site";

// Personal and cookie-bound: never cached, never prerendered.
export const dynamic = "force-dynamic";

/**
 * The member home — where an approved member lands after signing in.
 *
 * PRIVACY. Every query on this page runs through `getMemberDb()`, i.e. with
 * the member's own access token, so RLS decides what comes back. The
 * service-role client is not imported here and must not be. Other members are
 * read only from `directory_profiles`, with an explicit column list that never
 * includes email or phone. See lib/member-home.ts for the full set of rules.
 *
 * DESIGN. A personal page, not a dashboard: sections are typographic lists
 * separated by hairlines, the way the homepage's "What's on" is, rather than a
 * grid of tiles. Empty states are written, never blank boxes.
 */
export default async function MemberHomePage() {
  const session = await getMemberDb();
  if (!session) redirect("/connect/login");
  const { db, userId } = session;

  const me = await getOwnProfile(db, userId);
  if (!me) redirect("/connect/setup");
  if (me.status === "pending") redirect("/connect/pending");
  if (me.status !== "approved") redirect("/connect/status");

  const today = todayInIndia();
  const [institution, events, people, news] = await Promise.all([
    getInstitution(db, me.institution_id),
    getUpcomingEvents(db, me.institution_id, today),
    getPeople(db, me),
    getNews(db, me.institution_id),
  ]);

  const firstName = me.full_name.trim().split(/\s+/)[0] || me.full_name;
  const completeness = profileCompleteness(me);
  const roleLabel = roleMeta[me.role]?.label ?? me.role;

  return (
    <div className="bg-paper">
      <div className="container-page pb-24 pt-8 md:pt-12">
        <MemberNav current="home" profileId={me.id} />

        {/* 1 — WELCOME ------------------------------------------------- */}
        <header className="mt-10 flex items-center gap-5 md:mt-14 md:gap-7">
          <Avatar src={me.avatar_url} name={me.full_name} size={76} />
          <div className="min-w-0">
            <h1 className="type-h1 text-balance text-ink-900">
              Welcome back, {firstName}
            </h1>
            <p className="type-meta mt-2 text-ink-500">
              {roleLabel}
              {me.batch_year ? ` · Batch of ${me.batch_year}` : ""}
              {institution ? ` · ${institution.name}` : ""}
            </p>
          </div>
        </header>

        {/* 2 — PROFILE COMPLETENESS (hidden at 100%) ------------------- */}
        {completeness.missing.length > 0 && (
          <section
            aria-labelledby="complete-heading"
            className="mt-10 border-l-2 border-accent-500 pl-5 md:mt-12 md:pl-6"
          >
            <h2 id="complete-heading" className="type-h3 text-ink-900">
              Finish your profile
            </h2>
            <p className="type-meta mt-1 text-ink-500">
              {completeness.done} of {completeness.total} done
            </p>
            <ul className="mt-4 space-y-1">
              {completeness.missing.map((m) => (
                <li key={m.key}>
                  <Link
                    href="/connect/profile/edit"
                    className="inline-flex min-h-[2.75rem] items-center text-ink-900 underline decoration-ink-300 underline-offset-4 transition-colors hover:text-accent-700 hover:decoration-accent-500"
                  >
                    {m.prompt}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-14 grid gap-14 md:mt-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
          <div className="space-y-14">
            {/* 3 — UPCOMING ------------------------------------------- */}
            <Events
              events={events}
              institutionName={institution?.name ?? null}
              hasInstitution={!!institution}
            />

            {/* 5 — NEWS ----------------------------------------------- */}
            <News
              items={news.items}
              scope={news.scope}
              institutionName={institution?.name ?? null}
            />
          </div>

          <div className="space-y-14">
            {/* 4 — PEOPLE --------------------------------------------- */}
            <People
              people={people}
              institutionId={institution?.id ?? null}
              institutionName={institution?.name ?? null}
            />

            {/* 6 — QUICK LINKS ---------------------------------------- */}
            <section aria-labelledby="links-heading">
              <h2 id="links-heading" className="type-h3 text-ink-900">
                Quick links
              </h2>
              <ul className="mt-4 divide-y divide-ink-100 border-t border-ink-200">
                <QuickLink href="/connect/profile/edit">Edit your profile</QuickLink>
                <QuickLink href="/connect/directory">Member directory</QuickLink>
                <QuickLink href="/calendar">Central Calendar</QuickLink>
                {institution?.external_url && (
                  <QuickLink href={institution.external_url} external>
                    {institution.name} website
                  </QuickLink>
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function SectionHead({
  id,
  title,
  note,
}: {
  id: string;
  title: string;
  note?: string;
}) {
  return (
    <div>
      <h2 id={id} className="type-h2 text-ink-900">
        {title}
      </h2>
      {note && <p className="type-meta mt-2 text-ink-500">{note}</p>}
    </div>
  );
}

function Events({
  events,
  institutionName,
  hasInstitution,
}: {
  events: HomeEvent[];
  institutionName: string | null;
  hasInstitution: boolean;
}) {
  return (
    <section aria-labelledby="events-heading">
      <SectionHead
        id="events-heading"
        title="Coming up"
        note={
          hasInstitution && institutionName
            ? `At ${institutionName}, and across the network`
            : "Across the network"
        }
      />

      {events.length === 0 ? (
        <p className="type-body mt-5 text-ink-700">
          Nothing is scheduled just yet.{" "}
          <Link href="/calendar" className="link-rule text-ink-900">
            See the full calendar
          </Link>
        </p>
      ) : (
        <>
          <ul className="mt-6 border-t border-ink-200">
            {events.map((e) => (
              <li
                key={e.id}
                className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-start gap-4 border-b border-ink-200 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-6"
              >
                <EventDate iso={e.date_start} />
                <div className="min-w-0">
                  <h3 className="text-[1.0625rem] font-medium leading-snug text-ink-900">
                    {e.title}
                  </h3>
                  <p className="type-meta mt-1.5 text-ink-500">
                    {e.institution_name ?? "Across the network"}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/calendar" className="link-rule mt-5 text-ink-900">
            See the full calendar
          </Link>
        </>
      )}
    </section>
  );
}

/**
 * Day number in the display serif, month beneath it — the same treatment as
 * the homepage's "What's on". The readable date is a visually hidden span, not
 * aria-label on <time>, which axe rejects (aria-prohibited-attr).
 */
function EventDate({ iso }: { iso: string }) {
  const d = new Date(`${iso}T00:00:00`);
  const day = d.toLocaleDateString("en-GB", { day: "numeric" });
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const full = d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return (
    <time dateTime={iso} className="block">
      <span className="sr-only">{full}</span>
      <span
        aria-hidden="true"
        className="block font-[family-name:var(--font-display)] text-[2.25rem] leading-[0.9] tracking-[-0.03em] text-ink-900 sm:text-[2.75rem]"
      >
        {day}
      </span>
      <span aria-hidden="true" className="type-meta mt-1 block uppercase text-ink-500">
        {month}
      </span>
    </time>
  );
}

function People({
  people,
  institutionId,
  institutionName,
}: {
  people: HomePerson[];
  institutionId: string | null;
  institutionName: string | null;
}) {
  const scoped = !!institutionId && !!institutionName;

  // Early network: nobody else from their institution yet. Not an error — an
  // invitation.
  if (scoped && people.length === 0) {
    return (
      <section aria-labelledby="people-heading">
        <SectionHead id="people-heading" title={`People from ${institutionName}`} />
        <p className="type-body mt-5 text-ink-700">
          You&apos;re one of the first from {institutionName} here. Share the
          Member Network with your classmates and colleagues so they can find
          you.
        </p>
        <CopyInviteLink url={`${SITE_URL}/connect`} />
      </section>
    );
  }

  return (
    <section aria-labelledby="people-heading">
      <SectionHead
        id="people-heading"
        title={scoped ? `People from ${institutionName}` : "New to the network"}
        note={scoped ? undefined : "The newest members across every institution"}
      />

      {people.length === 0 ? (
        <p className="type-body mt-5 text-ink-700">
          No other members have joined yet. You&apos;re early.
        </p>
      ) : (
        <ul className="mt-6 border-t border-ink-200">
          {people.map((p) => (
            <li key={p.id} className="border-b border-ink-200">
              <Link
                href={`/connect/profile/${p.id}`}
                className="group flex min-h-[3.5rem] items-center gap-4 py-3.5"
              >
                <Avatar src={p.avatar_url} name={p.full_name} size={44} />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink-900 transition-colors group-hover:text-accent-700">
                    {p.full_name}
                  </span>
                  <span className="type-meta block truncate text-ink-500">
                    {roleMeta[p.role]?.label ?? p.role}
                    {p.batch_year ? ` · ${p.batch_year}` : ""}
                    {!scoped && p.institution_name ? ` · ${p.institution_name}` : ""}
                    {scoped && p.headline ? ` · ${p.headline}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={scoped ? `/connect/directory?institution=${encodeURIComponent(institutionId!)}` : "/connect/directory"}
        className="link-rule mt-5 text-ink-900"
      >
        {scoped ? `Everyone from ${institutionName}` : "Browse the directory"}
      </Link>
    </section>
  );
}

function News({
  items,
  scope,
  institutionName,
}: {
  items: HomeNews[];
  scope: "institution" | "network";
  institutionName: string | null;
}) {
  if (items.length === 0) return null;

  const title =
    scope === "institution" && institutionName
      ? `News from ${institutionName}`
      : "News from the network";

  return (
    <section aria-labelledby="news-heading">
      <SectionHead id="news-heading" title={title} />
      <ul className="mt-6 border-t border-ink-200">
        {items.map((n) => (
          <li key={n.id} className="border-b border-ink-200 py-5">
            <p className="type-meta text-ink-500">
              <time dateTime={n.published_at}>
                {new Date(`${n.published_at}T00:00:00`).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </p>
            <h3 className="mt-1.5 text-[1.0625rem] font-medium leading-snug text-ink-900">
              {n.title}
            </h3>
            {n.summary && (
              <p className="mt-1.5 line-clamp-2 text-[0.95rem] leading-relaxed text-ink-700">
                {n.summary}
              </p>
            )}
          </li>
        ))}
      </ul>
      <Link href="/news" className="link-rule mt-5 text-ink-900">
        All news and events
      </Link>
    </section>
  );
}

function QuickLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const cls =
    "flex min-h-[3rem] items-center justify-between gap-4 text-ink-900 transition-colors hover:text-accent-700";
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <Link href={href} className={cls}>
          {children}
        </Link>
      )}
    </li>
  );
}
