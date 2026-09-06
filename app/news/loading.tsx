import {
  PageHeaderSkeleton,
  FilterBarSkeleton,
  CardSkeleton,
  LoadingAnnouncer,
} from "@/components/Skeleton";

export default function NewsLoading() {
  return (
    <>
      <LoadingAnnouncer label="Loading news and events" />
      <PageHeaderSkeleton />

      <div aria-hidden="true" className="container-page py-14">
        {/* Type tabs */}
        <div className="border-b border-slate-200 pb-4">
          <FilterBarSkeleton count={3} />
        </div>

        {/* Institution filter */}
        <div className="mt-4">
          <FilterBarSkeleton count={7} />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
