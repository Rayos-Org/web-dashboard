"use client";

import { useWallet } from "@/hooks/useWallet";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Users, AlertTriangle, ExternalLink, Info } from "lucide-react";

/**
 * Guardians are the wallet's on-chain signers plus the PolicyModule's guardian
 * set. Signers are read live from the wallet contract. Adding/removing
 * guardians calls `add_guardian` / `remove_guardian` on the PolicyModule,
 * which is owner-gated on the current testnet deployment — so those actions
 * are shown disabled instead of faking success.
 */
export function GuardianList({ walletAddress }: { walletAddress: string }) {
  const { data, isLoading } = useWallet(walletAddress);
  const signers = data?.signers ?? [];
  const threshold = signers.length === 0 ? 0 : Math.max(1, Math.ceil(signers.length / 2));

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle>Recovery Guardians</CardTitle>
        <CardDescription>Trusted signers who can authorize wallet recovery — read live from your wallet contract.</CardDescription>
        <CardAction>
          <Button disabled title="Guardian management ships with the next PolicyModule release">
            <Plus data-icon="inline-start" /> Add Guardian
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <div>
            <p className="text-sm font-medium">Recovery Threshold</p>
            <p className="text-xs text-muted-foreground mt-0.5">Minimum approvals required to execute recovery</p>
          </div>
          <Badge variant="outline" className="h-9 border-primary/40 bg-card px-4 font-mono text-base text-primary">
            {threshold} of {signers.length}
          </Badge>
        </div>

        <Alert>
          <Info />
          <AlertDescription className="text-sm">
            Guardian add/remove and recovery execution go through the PolicyModule, whose testnet deployment is
            owner-gated. The recovery <em>proposal</em> flow (Lost device → Recover) and guardian approvals are live
            on the relay; on-chain execution lands with the next contract release.
          </AlertDescription>
        </Alert>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {!isLoading && !data?.exists && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Wallet contract not found on-chain. Deploy a wallet first.</AlertDescription>
          </Alert>
        )}

        {!isLoading && signers.length > 0 && (
          <div className="divide-y overflow-hidden rounded-xl border border-border">
            {signers.map((signer) => (
              <div
                key={signer.credentialId}
                className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/20">
                    <Users className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm" title={signer.credentialId}>
                      {signer.credentialId.slice(0, 16)}…
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Passkey signer · P-256 · weight {signer.weight}</p>
                  </div>
                </div>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                  title="View wallet contract"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
