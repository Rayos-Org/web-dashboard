import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GuardianList } from "@/components/guardians/GuardianList";
import { RecoveryStatusBanner } from "@/components/guardians/RecoveryStatusBanner";

export default async function GuardiansPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Guardians & Recovery</h1>
        <p className="text-muted-foreground">
          Manage your recovery guardians and view active recovery proposals.
        </p>
      </div>

      <RecoveryStatusBanner walletAddress={session.walletAddress} />
      
      <div className="mt-6">
        <GuardianList walletAddress={session.walletAddress} />
      </div>
    </div>
  );
}
