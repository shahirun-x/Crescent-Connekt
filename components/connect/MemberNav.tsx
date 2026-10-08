import Link from "next/link";

type Section = "home" | "directory" | "profile";

/**
 * Navigation between the three places an approved member goes: their home,
 * the directory, and their own profile.
 *
 * Same idiom as the site header — a hairline under the current word, not a
 * row of tinted pills — so the member area reads as part of the site rather
 * than as a separate app bolted on.
 */
export default function MemberNav({
  current,
  profileId,
}: {
  current: Section;
  profileId: string;
}) {
  const items: { key: Section; href: string; label: string }[] = [
    { key: "home", href: "/connect/home", label: "Home" },
    { key: "directory", href: "/connect/directory", label: "Directory" },
    { key: "profile", href: `/connect/profile/${profileId}`, label: "My profile" },
  ];

  return (
    <nav aria-label="Member Network" className="border-b border-ink-200">
      <ul className="flex gap-7">
        {items.map((item) => {
          const active = item.key === current;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px inline-flex min-h-[2.75rem] items-center border-b-2 text-[0.95rem] transition-colors ${
                  active
                    ? "border-accent-500 text-ink-900"
                    : "border-transparent text-ink-700 hover:text-ink-900"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
