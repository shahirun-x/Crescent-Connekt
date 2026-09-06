import AdminLoading from "@/components/admin/AdminLoading";
import { AdminHeadingSkeleton, TableSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AdminLoading label="Loading news articles">
      <AdminHeadingSkeleton />
      <div className="mt-6">
        <TableSkeleton rows={6} />
      </div>
    </AdminLoading>
  );
}
