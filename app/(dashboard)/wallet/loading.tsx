import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeader title="Wallet" description="Your balances and on-chain activity." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[250px] w-full rounded-xl" />
        <Skeleton className="h-[250px] w-full rounded-xl" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
