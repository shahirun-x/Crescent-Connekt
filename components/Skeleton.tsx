/**
 * Skeleton primitives for route-level loading.tsx files.
 *
 * These mirror the real layouts' dimensions and container classes so content
 * swaps in without shifting. `aria-hidden` throughout with a single polite
 * live region per screen — a screen reader should hear "Loading…" once, not
 * read out a tree of empty boxes.
 */

export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-200/70 ${className}`} />
  );
}

/** Announces the loading state once, visually hidden. */
export function LoadingAnnouncer({ label }: { label: string }) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {label}
    </p>
  );
}

/** Matches PageHeader: eyebrow, h1, description, on the slate-50 band. */
export function PageHeaderSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="border-b border-slate-200 bg-slate-50"
    >
      <div className="container-page py-14 md:py-20">
        <Shimmer className="h-3 w-40" />
        <Shimmer className="mt-3 h-10 w-full max-w-lg sm:h-11 lg:h-12" />
        <Shimmer className="mt-4 h-4 w-full max-w-2xl" />
        <Shimmer className="mt-2 h-4 w-full max-w-xl" />
      </div>
    </section>
  );
}

/** A row of filter pills. */
export function FilterBarSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Shimmer key={i} className="h-8 w-24 rounded-full" />
      ))}
    </div>
  );
}

/** Generic content card, used by the news and institutions grids. */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-6">
      <Shimmer className="h-3 w-28" />
      <Shimmer className="mt-3 h-5 w-4/5" />
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer key={i} className="mt-2 h-3.5 w-full" />
      ))}
      <Shimmer className="mt-4 h-3 w-24" />
    </div>
  );
}

/** Centred avatar card, matching MemberCard. */
export function MemberCardSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-card border border-slate-200 bg-white p-6">
      <Shimmer className="h-20 w-20 rounded-full" />
      <Shimmer className="mt-4 h-4 w-32" />
      <Shimmer className="mt-2.5 h-5 w-24 rounded-full" />
      <Shimmer className="mt-3 h-3.5 w-full" />
      <Shimmer className="mt-2 h-3.5 w-5/6" />
      <Shimmer className="mt-5 h-3 w-28" />
    </div>
  );
}

/** Admin table: header strip plus rows. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="border-b bg-slate-50 px-4 py-3">
        <Shimmer className="h-3 w-48" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-4 w-28" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Admin page heading row. */
export function AdminHeadingSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-center justify-between">
      <Shimmer className="h-8 w-44" />
      <Shimmer className="h-9 w-32 rounded-lg" />
    </div>
  );
}
