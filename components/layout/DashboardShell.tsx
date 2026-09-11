"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { Wallet, ShieldAlert, Users, LogOut, Menu, Copy, ExternalLink, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AuroraBackground } from "@/components/motion/AuroraBackground";
import { PageTransition } from "@/components/motion/PageTransition";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/policies", label: "Policies", icon: ShieldAlert },
  { href: "/guardians", label: "Guardians", icon: Users },
] as const;

interface DashboardShellProps {
  walletAddress: string;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

function NavLinks({ onNavigate, layoutId }: { onNavigate?: () => void; layoutId: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "text-sidebar-primary-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-primary shadow-[0_8px_20px_-8px_var(--primary)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <item.icon className="relative size-[18px]" />
            <span className="relative flex-1">{item.label}</span>
            <ChevronRight
              className={cn(
                "relative size-4 transition-all",
                active
                  ? "opacity-70"
                  : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}

function WalletChip({ walletAddress }: { walletAddress: string }) {
  const short = `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
  const copy = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied");
  };
  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Active wallet
        </p>
        <Badge
          variant="outline"
          className="h-5 border-success/40 bg-success/10 px-1.5 text-[10px] text-success"
        >
          Testnet
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate font-mono text-sm" title={walletAddress}>
          {short}
        </code>
        <button
          onClick={copy}
          className="text-muted-foreground transition-colors hover:text-foreground"
          title="Copy address"
          aria-label="Copy wallet address"
        >
          <Copy className="size-3.5" />
        </button>
        <a
          href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-primary"
          title="View on explorer"
          aria-label="View on Stellar Expert"
        >
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}

function SidebarBody({
  walletAddress,
  logoutAction,
  onNavigate,
  layoutId,
}: {
  walletAddress: string;
  logoutAction: () => Promise<void>;
  onNavigate?: () => void;
  layoutId: string;
}) {
  return (
    <>
      <div className="px-2">
        <NavLinks onNavigate={onNavigate} layoutId={layoutId} />
      </div>
      <div className="mt-auto flex flex-col gap-3 px-2">
        <WalletChip walletAddress={walletAddress} />
        <ThemeToggle withLabel />
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut data-icon="inline-start" />
            Sign Out
          </Button>
        </form>
      </div>
    </>
  );
}

export function DashboardShell({ walletAddress, logoutAction, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const current = NAV.find((n) => pathname.startsWith(n.href));

  return (
    <div className="relative flex min-h-screen bg-background">
      <AuroraBackground grid intensity={0.55} spotlight={false} className="fixed" />

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar/80 px-3 py-6 backdrop-blur-xl md:flex">
        <Link href="/wallet" className="flex items-center gap-3 px-3">
          <span className="relative">
            <span className="absolute inset-0 rounded-xl bg-primary/40 blur-md" />
            <Image
              src="/logo.png"
              alt="Guardian Wallet"
              width={34}
              height={34}
              className="relative rounded-xl"
            />
          </span>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight">Guardian</p>
            <p className="text-[11px] text-muted-foreground">Smart wallet</p>
          </div>
        </Link>
        <SidebarBody
          walletAddress={walletAddress}
          logoutAction={logoutAction}
          layoutId="nav-active-desktop"
        />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation"
                  />
                }
              >
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" className="w-[84vw] max-w-xs gap-6 py-6">
                <SheetHeader className="px-5 py-0">
                  <SheetTitle className="flex items-center gap-2.5">
                    <Image src="/logo.png" alt="" width={28} height={28} className="rounded-lg" />
                    Guardian
                  </SheetTitle>
                </SheetHeader>
                <SidebarBody
                  walletAddress={walletAddress}
                  logoutAction={logoutAction}
                  onNavigate={() => setMobileOpen(false)}
                  layoutId="nav-active-mobile"
                />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 md:hidden">
              <Image src="/logo.png" alt="Guardian Wallet" width={26} height={26} className="rounded-lg" />
              <span className="font-bold">Guardian</span>
            </div>

            <div className="hidden items-center gap-2 text-sm md:flex">
              <span className="text-muted-foreground">Dashboard</span>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="font-medium">{current?.label ?? "Wallet"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden border-primary/40 bg-primary/10 text-primary sm:inline-flex"
            >
              <span className="size-1.5 rounded-full bg-primary" /> Stellar Testnet
            </Badge>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-5xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
