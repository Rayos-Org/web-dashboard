"use client";

import { useState } from "react";
import { NATIVE_XLM_CONTRACT_ID, formatXLM, toStroops } from "@/hooks/useWallet";
import { useSpendLimit, useSetSpendLimit } from "@/hooks/usePolicies";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, ExternalLink, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

const WINDOWS = [
  { label: "1 Hour", value: "3600" },
  { label: "24 Hours", value: "86400" },
  { label: "7 Days", value: "604800" },
];

const POLICY_CONTRACT = process.env.NEXT_PUBLIC_POLICY_CONTRACT_ID ?? "";

export function SpendLimitForm({
  walletAddress,
  credentialId,
}: {
  walletAddress: string;
  credentialId?: string;
}) {
  const [amount, setAmount] = useState("");
  const [windowSecs, setWindowSecs] = useState("86400");

  const { data: activeLimit, isLoading: loadingLimit } = useSpendLimit(walletAddress);
  const setLimitMutation = useSetSpendLimit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialId) {
      toast.error("Signing credential not found in session. Please log in again.");
      return;
    }

    try {
      const stroopsAmount = toStroops(amount);
      if (stroopsAmount <= 0n) {
        toast.error("Please enter a positive limit amount");
        return;
      }

      toast.info("Please verify the passkey prompt to authorize spend limit...");
      const res = await setLimitMutation.mutateAsync({
        walletAddress,
        tokenAddress: NATIVE_XLM_CONTRACT_ID,
        amount: stroopsAmount,
        windowSecs: BigInt(windowSecs),
        credentialId,
      });

      toast.success(
        <div>
          <p className="font-medium">Spend limit successfully set on-chain!</p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${res.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline inline-flex items-center gap-1 mt-1"
          >
            View transaction <ExternalLink className="size-3" />
          </a>
        </div>
      );
      setAmount("");
    } catch (err: any) {
      toast.error(err.message || "Failed to set spend limit");
    }
  };

  const windowLabel = WINDOWS.find((w) => w.value === String(activeLimit?.windowSecs))?.label || `${activeLimit?.windowSecs ?? 0}s`;

  return (
    <div className="space-y-6">
      {/* Current Active Limit Status */}
      <Card>
        <CardHeader className="border-b pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Active Spend Policy</CardTitle>
              <CardDescription>
                Enforced directly by the Soroban contract on every outgoing transfer.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-medium flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                Enforced On-Chain
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingLimit ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : activeLimit && activeLimit.amount > 0n ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Limit Cap</p>
                  <p className="text-2xl font-semibold mt-1">{formatXLM(activeLimit.amount)} <span className="text-sm font-normal text-muted-foreground">XLM</span></p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Rolling Window</p>
                  <p className="text-2xl font-semibold mt-1 flex items-center gap-1.5">
                    <Clock className="size-5 text-muted-foreground" />
                    {windowLabel}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Spent in Window</p>
                  <p className="text-2xl font-semibold mt-1">{formatXLM(activeLimit.currentAccumulated)} <span className="text-sm font-normal text-muted-foreground">XLM</span></p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Remaining allowance: <strong className="text-foreground">{formatXLM(activeLimit.amount - activeLimit.currentAccumulated)} XLM</strong></span>
                <span className="font-mono">Policy: {POLICY_CONTRACT ? `${POLICY_CONTRACT.slice(0, 8)}...` : "Active"}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-muted p-6 text-center text-muted-foreground">
              <p className="text-sm">No spend limit is currently configured for this wallet.</p>
              <p className="text-xs mt-1">Configure a cap below to prevent unauthorized large transfers.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configure Limit Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="border-b pb-6">
            <CardTitle>Configure Spend Limit</CardTitle>
            <CardDescription>
              Set a per-window spending ceiling. Transfers exceeding this threshold will revert on-chain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={NATIVE_XLM_CONTRACT_ID} items={{ [NATIVE_XLM_CONTRACT_ID]: "XLM (Native)" }} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NATIVE_XLM_CONTRACT_ID}>XLM (Native)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit-amount">Limit Amount (XLM)</Label>
              <Input
                id="limit-amount"
                type="number"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Time Window</Label>
              <Select value={windowSecs} onValueChange={(v) => v && setWindowSecs(v)} items={WINDOWS}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WINDOWS.map((w) => (
                    <SelectItem key={w.value} value={w.value}>
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={setLimitMutation.isPending || !amount || parseFloat(amount) <= 0}
            >
              {setLimitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Authorizing with Passkey...
                </>
              ) : (
                "Set Spend Limit (Passkey Authorized)"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
