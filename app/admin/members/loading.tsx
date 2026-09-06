import AdminLoading from "@/components/admin/AdminLoading";
import { Shimmer, FilterBarSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AdminLoading label="Loading members">
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-36" />
        <Shimmer className="h-9 w-56 rounded-lg" />
      </div>

      {/* Status tabs */}
      <div className="mt-4 border-b border-slate-200 pb-3">
        <FilterBarSkeleton count={4} />
      </div>

      {/* Pending tab shows applicant cards, not a table */}
      <div className="mt-5 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex gap-4">
              <Shimmer className="h-16 w-16 shrink-0 rounded-full" />
              <div className="flex-1">
                <Shimmer className="h-5 w-48" />
                <Shimmer className="mt-2 h-3.5 w-64" />
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Shimmer key={j} className="h-3.5 w-full" />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Shimmer className="h-9 w-24 rounded-lg" />
              <Shimmer className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </AdminLoading>
  );
}
