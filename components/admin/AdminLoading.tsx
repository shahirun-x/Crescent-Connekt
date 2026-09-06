import { Shimmer, LoadingAnnouncer } from "@/components/Skeleton";

/**
 * Loading shell for /admin/* routes.
 *
 * A route-level loading.tsx replaces the whole page, AdminShell included, so
 * this reproduces the sidebar geometry (w-56, slate-900) and the slate-50
 * content area. Without it the sidebar would vanish and snap back when the
 * page resolves.
 */
export default function AdminLoading({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <LoadingAnnouncer label={label} />
      <div aria-hidden="true" className="flex min-h-screen">
        <aside className="flex w-56 shrink-0 flex-col bg-slate-900">
          <div className="border-b border-slate-700 px-4 py-4">
            <Shimmer className="h-4 w-32 bg-slate-700" />
          </div>
          <nav className="flex-1 space-y-1.5 px-2 py-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Shimmer key={i} className="h-9 w-full rounded-lg bg-slate-800" />
            ))}
          </nav>
          <div className="border-t border-slate-700 px-4 py-3">
            <Shimmer className="h-3 w-28 bg-slate-700" />
          </div>
        </aside>

        <main className="flex-1 bg-slate-50 p-6">{children}</main>
      </div>
    </>
  );
}
