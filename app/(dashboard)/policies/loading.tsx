import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Policies & Session Keys"
        description="Manage spending limits, time-locks, and scoped session keys."
      />
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>
  );
}
