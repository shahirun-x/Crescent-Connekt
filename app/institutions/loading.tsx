import {
  PageHeaderSkeleton,
  FilterBarSkeleton,
  CardSkeleton,
  LoadingAnnouncer,
  Shimmer,
} from "@/components/Skeleton";

export default function InstitutionsLoading() {
  return (
    <>
      <LoadingAnnouncer label="Loading institutions" />
      <PageHeaderSkeleton />

      <div aria-hidden="true" className="container-page py-14">
        {/* Search field + pillar filters */}
        <Shimmer className="h-11 w-full max-w-md rounded-full" />
        <div className="mt-4">
          <FilterBarSkeleton count={5} />
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} lines={2} />
          ))}
        </div>
      </div>
    </>
  );
}
