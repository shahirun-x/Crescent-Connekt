import AdminLoading from "@/components/admin/AdminLoading";
import { Shimmer } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AdminLoading label="Loading contact messages">
      <Shimmer className="h-8 w-56" />
      <Shimmer className="mt-2 h-4 w-28" />

      {/* Collapsed accordion rows, matching ContactsViewer */}
      <div className="mt-5 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <Shimmer className="h-2 w-2 rounded-full" />
              <Shimmer className="h-4 w-36" />
              <Shimmer className="h-3.5 w-48" />
            </div>
            <Shimmer className="h-3 w-20" />
          </div>
        ))}
      </div>
    </AdminLoading>
  );
}
