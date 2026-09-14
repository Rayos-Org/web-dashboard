"use client";

import { useWallet, useFaucet, formatXLM } from "@/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QuickSend } from "./QuickSend";
import { Copy, ArrowDownLeft, AlertTriangle, ExternalLink, Droplets, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BalanceCardProps {
  walletAddress: string;
  credentialId: string;
}

export function BalanceCard({ walletAddress, credentialId }: BalanceCardProps) {
  const { data, isLoading, isError } = useWallet(walletAddress);
  const faucet = useFaucet();

  const balance = data?.balance ?? 0n;
  const unfunded = !!data && data.balance === 0n;
  const shortAddress = `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied");
  };

  const requestFaucet = async () => {
    try {
      const res = await faucet.mutateAsync(walletAddress);
      toast.success("Testnet XLM received", {
        description: `${Number(res.amount) / 1e7} XLM · tx ${res.txHash.slice(0, 10)}…`,
      });
    } catch (err: any) {
      toast.error(err?.message || "Faucet request failed");
    }
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
          {data && !data.exists && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" /> Not deployed
            </Badge>
          )}
          {data?.exists && unfunded && (
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
              Unfunded
            </Badge>
          )}
          {data?.exists && !unfunded && (
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
            <p className="text-xs text-destructive mt-1">Couldn&apos;t read the wallet contract from Soroban RPC</p>
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
            href={`https://stellar.expert/explorer/testnet/contract/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8.5 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            title="View contract on explorer"
            aria-label="View on explorer"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>

        {data?.exists && unfunded && (
          <Alert className="border-warning/40 bg-warning/10 text-foreground">
            <Droplets className="text-warning" />
            <AlertDescription className="text-sm flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>Your smart wallet is live but empty. Grab some testnet XLM to try a send.</span>
              <Button size="sm" variant="outline" onClick={requestFaucet} disabled={faucet.isPending}>
                {faucet.isPending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" /> Funding…
                  </>
                ) : (
                  <>
                    <Droplets data-icon="inline-start" /> Get testnet XLM
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <QuickSend walletAddress={walletAddress} credentialId={credentialId} disabled={!data?.exists || unfunded} />
          <Button variant="outline" className="flex-1" onClick={copyAddress}>
            <ArrowDownLeft data-icon="inline-start" /> Receive
          </Button>
          {data?.exists && !unfunded && (
            <Button variant="ghost" size="icon" onClick={requestFaucet} disabled={faucet.isPending} title="Get more testnet XLM">
              {faucet.isPending ? <Loader2 className="animate-spin" /> : <Droplets />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
