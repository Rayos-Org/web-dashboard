"use client";

import { useState } from "react";
import { NATIVE_XLM_CONTRACT_ID } from "@/hooks/useWallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, ExternalLink } from "lucide-react";

const WINDOWS = [
  { label: "1 Hour", value: "3600" },
  { label: "24 Hours", value: "86400" },
  { label: "7 Days", value: "604800" },
];

const POLICY_CONTRACT = process.env.NEXT_PUBLIC_POLICY_CONTRACT_ID ?? "";

/**
 * Spend limits live in the on-chain PolicyModule (`set_spend_limit`). The
 * testnet deployment of that contract is owner-gated to the deployer key, so
 * per-wallet limits can't be written from the app yet. This screen previews
 * the configuration honestly instead of pretending to submit it.
 */
export function SpendLimitForm({ walletAddress }: { walletAddress: string }) {
  const [amount, setAmount] = useState("");
  const [window, setWindow] = useState("86400");

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Spend Limit</CardTitle>
            <CardDescription>A rolling cap enforced by the on-chain policy module.</CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
              Preview
            </Badge>
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500 font-medium">
              Coming Soon
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <Info className="text-amber-500 shrink-0" />
          <AlertDescription className="text-sm">
            <span className="font-semibold text-foreground">Coming Soon:</span> The policy contract on testnet (
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${POLICY_CONTRACT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {POLICY_CONTRACT.slice(0, 8)}…
            </a>
            ) is owner-gated in its current release, so per-wallet limits for{" "}
            <code className="font-mono text-xs">{walletAddress.slice(0, 8)}…</code> can&apos;t be written from here yet.
            Sends are still passkey-verified on-chain by your wallet contract. Track status on{" "}
            <a
              href="https://github.com/Rayos-Org/web-dashboard/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              GitHub Tracking Issues
              <ExternalLink className="inline h-3 w-3" />
            </a>.
          </AlertDescription>
        </Alert>
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
          <Label>Limit Amount (XLM)</Label>
          <Input
            type="number"
            placeholder="100.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label>Time Window</Label>
          <Select value={window} onValueChange={(v) => v && setWindow(v)} items={WINDOWS}>
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
        <Button type="button" size="lg" disabled className="w-full" title="Requires the next PolicyModule release">
          Set Spend Limit — Coming Soon in next contract release
        </Button>
      </CardFooter>
    </Card>
  );
}
