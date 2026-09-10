import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wallet, ShieldAlert, Users, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

import Image from "next/image";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { walletAddress } = session;
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card px-4 py-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          <Image src="/logo.png" alt="Guardian Wallet Logo" width={32} height={32} />
          <span className="font-bold text-lg text-primary">Guardian</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/wallet">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Wallet className="h-4 w-4" />
              Wallet
            </Button>
          </Link>
          <Link href="/policies">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <ShieldAlert className="h-4 w-4" />
              Policies
            </Button>
          </Link>
          <Link href="/guardians">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Users className="h-4 w-4" />
              Guardians
            </Button>
          </Link>
        </nav>

        <div className="mt-auto border-t pt-4">
          <div className="px-2 py-3 mb-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
              Active Wallet
            </p>
            <p className="font-mono text-sm" title={walletAddress}>
              {shortAddress}
            </p>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Guardian Wallet Logo" width={24} height={24} />
            <span className="font-bold text-primary">Guardian</span>
          </div>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
