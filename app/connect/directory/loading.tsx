import {
  PageHeaderSkeleton,
  MemberCardSkeleton,
  LoadingAnnouncer,
  Shimmer,
} from "@/components/Skeleton";

export default function DirectoryLoading() {
  return (
    <>
      <LoadingAnnouncer label="Loading the member directory" />
      <PageHeaderSkeleton />

      <div aria-hidden="true" className="container-page py-10">
        {/* Signed-in-as bar */}
        <Shimmer className="h-14 w-full rounded-card" />

        {/* Search + sort + filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Shimmer className="h-11 flex-1 rounded-full" />
          <Shimmer className="h-11 w-44 rounded-full" />
          <Shimmer className="h-11 w-28 rounded-full" />
        </div>

        <Shimmer className="mt-6 h-4 w-28" />

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MemberCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
