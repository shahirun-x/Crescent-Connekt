import {
  PageHeaderSkeleton,
  FilterBarSkeleton,
  LoadingAnnouncer,
  Shimmer,
} from "@/components/Skeleton";

export default function CalendarLoading() {
  return (
    <>
      <LoadingAnnouncer label="Loading the Central Calendar" />
      <PageHeaderSkeleton />

      <div aria-hidden="true" className="container-page py-10">
        {/* Time-range + view toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterBarSkeleton count={4} />
          <Shimmer className="h-9 w-40 rounded-full" />
        </div>

        {/* Category filter pills */}
        <div className="mt-4">
          <FilterBarSkeleton count={9} />
        </div>

        {/* Month grid — 7 columns, 6 rows, matching the real calendar */}
        <div className="mt-8 rounded-card border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <Shimmer className="h-6 w-40" />
            <div className="flex gap-2">
              <Shimmer className="h-8 w-8 rounded-full" />
              <Shimmer className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <Shimmer key={`h-${i}`} className="h-4" />
            ))}
            {Array.from({ length: 42 }).map((_, i) => (
              <Shimmer key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Event list below the grid */}
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-card border border-slate-200 bg-white p-5 sm:grid-cols-[8.5rem_1fr]"
            >
              <Shimmer className="h-4 w-32" />
              <div>
                <Shimmer className="h-5 w-2/3" />
                <Shimmer className="mt-2 h-3.5 w-1/2" />
                <Shimmer className="mt-2 h-3.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
