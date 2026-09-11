import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { TransactionList } from "@/components/wallet/TransactionList";
import { SignersCard } from "@/components/wallet/SignersCard";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function WalletPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-8">
      <PageHeader title="Wallet" description="Your balances and on-chain activity." />

      <div className="grid gap-6 lg:grid-cols-2">
        <BalanceCard walletAddress={session.walletAddress} />
        <SignersCard walletAddress={session.walletAddress} />
      </div>

      <TransactionList walletAddress={session.walletAddress} />
    </div>
  );
}
