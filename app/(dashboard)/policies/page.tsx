import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpendLimitForm } from "@/components/policies/SpendLimitForm";
import { SessionKeyList } from "@/components/policies/SessionKeyList";
import { AllowListEditor } from "@/components/policies/AllowListEditor";

export default async function PoliciesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Policies</h1>
        <p className="text-muted-foreground">
          Configure spend limits, session keys, and allow-lists to secure your wallet.
        </p>
      </div>

      <Tabs defaultValue="spend-limits" className="w-full mt-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="spend-limits">Spend Limits</TabsTrigger>
          <TabsTrigger value="session-keys">Session Keys</TabsTrigger>
          <TabsTrigger value="allow-list">Allow-List</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="spend-limits" className="m-0">
            <SpendLimitForm walletAddress={session.walletAddress} />
          </TabsContent>
          <TabsContent value="session-keys" className="m-0">
            <SessionKeyList walletAddress={session.walletAddress} />
          </TabsContent>
          <TabsContent value="allow-list" className="m-0">
            <AllowListEditor walletAddress={session.walletAddress} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
