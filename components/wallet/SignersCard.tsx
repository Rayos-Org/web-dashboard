"use client";

import { useWallet } from "@/hooks/useWallet";
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
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> Authorized Signers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <KeyRound className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{hex}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Passkey signer</p>
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
