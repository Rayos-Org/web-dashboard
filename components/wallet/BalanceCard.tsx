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
    <Card className="overflow-hidden">
      {/* Gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-amber-400 to-primary/60" />

      <CardHeader className="pb-2 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Balance · Testnet
          </CardTitle>
          {!checkingAccount && accountExists === false && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" /> Unfunded
            </Badge>
          )}
          {!checkingAccount && accountExists && (
            <Badge variant="secondary" className="text-xs gap-1">
              ● Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : isError ? (
          <div>
            <p className="text-2xl font-bold text-muted-foreground">—</p>
            <p className="text-xs text-destructive mt-1">Failed to load balance</p>
          </div>
        ) : (
          <div>
            <p className="text-5xl font-extrabold tracking-tight">
              {formatXLM(balance)}
              <span className="text-xl font-medium text-muted-foreground ml-2">XLM</span>
            </p>
          </div>
        )}

        {/* Wallet address row */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
          <code className="text-xs font-mono text-muted-foreground flex-1 truncate">{shortAddress}</code>
          <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Copy address">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors shrink-0"
            title="View on explorer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {!checkingAccount && accountExists === false && (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs">
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
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={copyAddress}
          >
            <ArrowDownLeft className="h-4 w-4" /> Receive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
