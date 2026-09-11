import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GuardianList } from "@/components/guardians/GuardianList";
import { RecoveryStatusBanner } from "@/components/guardians/RecoveryStatusBanner";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function GuardiansPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Guardians & Recovery"
        description="Manage your recovery guardians and view active recovery proposals."
      />

      <RecoveryStatusBanner walletAddress={session.walletAddress} />

      <GuardianList walletAddress={session.walletAddress} />
    </div>
  );
}
