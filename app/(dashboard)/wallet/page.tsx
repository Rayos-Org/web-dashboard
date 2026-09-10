import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { TransactionList } from "@/components/wallet/TransactionList";
import { SignersCard } from "@/components/wallet/SignersCard";

export default async function WalletPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground mt-1">Your balances and on-chain activity.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BalanceCard walletAddress={session.walletAddress} />
        <SignersCard walletAddress={session.walletAddress} />
      </div>

      <TransactionList walletAddress={session.walletAddress} />
    </div>
  );
}
