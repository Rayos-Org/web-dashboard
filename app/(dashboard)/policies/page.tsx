import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpendLimitForm } from "@/components/policies/SpendLimitForm";
import { SessionKeyList } from "@/components/policies/SessionKeyList";
import { AllowListEditor } from "@/components/policies/AllowListEditor";
import { PageHeader } from "@/components/layout/PageHeader";
import { Gauge, KeyRound, ListChecks } from "lucide-react";

export default async function PoliciesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Policies"
        description="Configure spend limits, session keys, and allow-lists to secure your wallet."
      />

      <Tabs defaultValue="spend-limits" className="w-full gap-6">
        <TabsList className="grid w-full grid-cols-3 sm:inline-flex sm:w-fit">
          <TabsTrigger value="spend-limits">
            <Gauge data-icon="inline-start" />
            <span className="hidden sm:inline">Spend Limits</span>
            <span className="sm:hidden">Limits</span>
          </TabsTrigger>
          <TabsTrigger value="session-keys">
            <KeyRound data-icon="inline-start" />
            <span className="hidden sm:inline">Session Keys</span>
            <span className="sm:hidden">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="allow-list">
            <ListChecks data-icon="inline-start" />
            Allow-List
          </TabsTrigger>
        </TabsList>
        <TabsContent value="spend-limits">
          <SpendLimitForm walletAddress={session.walletAddress} />
        </TabsContent>
        <TabsContent value="session-keys">
          <SessionKeyList walletAddress={session.walletAddress} />
        </TabsContent>
        <TabsContent value="allow-list">
          <AllowListEditor walletAddress={session.walletAddress} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
