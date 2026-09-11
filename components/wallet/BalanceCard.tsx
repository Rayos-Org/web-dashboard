"use client";

import { useWallet, NATIVE_XLM_CONTRACT_ID, formatXLM } from "@/hooks/useWallet";
import { useAccountExists } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QuickSend } from "./QuickSend";
import { Copy, ArrowDownLeft, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function BalanceCard({ walletAddress }: { walletAddress: string }) {
  const { data, isLoading, isError } = useWallet(walletAddress);
  const { data: accountExists, isLoading: checkingAccount } = useAccountExists(walletAddress);

  const balance = data?.balances?.[NATIVE_XLM_CONTRACT_ID];
  const shortAddress = `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied");
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/15 to-cyan-400/20 blur-3xl"
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />

      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Balance · Testnet
          </CardTitle>
          {!checkingAccount && accountExists === false && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" /> Unfunded
            </Badge>
          )}
          {!checkingAccount && accountExists && (
            <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
              <span className="size-1.5 rounded-full bg-success" /> Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : isError ? (
          <div>
            <p className="text-2xl font-bold text-muted-foreground">—</p>
            <p className="text-xs text-destructive mt-1">Failed to load balance</p>
          </div>
        ) : (
          <div>
            <p className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              {formatXLM(balance)}
              <span className="ml-2 text-xl font-medium text-muted-foreground">XLM</span>
            </p>
          </div>
        )}

        {/* Wallet address row */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 py-2 pl-3.5 pr-1.5">
          <code className="flex-1 truncate font-mono text-sm text-muted-foreground">{shortAddress}</code>
          <Button variant="ghost" size="icon-sm" onClick={copyAddress} title="Copy address" aria-label="Copy address">
            <Copy />
          </Button>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8.5 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            title="View on explorer"
            aria-label="View on explorer"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>

        {!checkingAccount && accountExists === false && (
          <Alert className="border-warning/40 bg-warning/10 text-foreground">
            <AlertTriangle className="text-warning" />
            <AlertDescription className="text-sm">
              Fund this address on{" "}
              <a
                href={`https://friendbot.stellar.org?addr=${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Stellar Friendbot
              </a>{" "}
              to activate your wallet.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <QuickSend walletAddress={walletAddress} />
          <Button variant="outline" className="flex-1" onClick={copyAddress}>
            <ArrowDownLeft data-icon="inline-start" /> Receive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
