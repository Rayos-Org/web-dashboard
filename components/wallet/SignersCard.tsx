"use client";

import { useWallet } from "@/hooks/useWallet";
import { Buffer } from "buffer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KeyRound, ShieldCheck } from "lucide-react";

export function SignersCard({ walletAddress }: { walletAddress: string }) {
  const { data, isLoading } = useWallet(walletAddress);
  const signers = data?.signers ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" /> Authorized Signers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}
        {!isLoading && signers.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No signers data available.
          </div>
        )}
        {!isLoading && signers.map((s, i) => {
          const hex = Buffer.from(s.publicKeyBytes).toString("hex").slice(0, 16) + "…";
          return (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/20">
                  <KeyRound className="size-4" />
                </div>
                <div>
                  <p className="font-mono text-sm">{hex}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Passkey signer</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Weight {s.weight}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
