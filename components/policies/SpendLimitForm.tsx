"use client";

import { useState } from "react";
import { walletSdk } from "@/lib/sdk-client";
import { NATIVE_XLM_CONTRACT_ID } from "@/hooks/useWallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";
import { startAuthentication } from "@simplewebauthn/browser";
import { Buffer } from "buffer";

const WINDOWS = [
  { label: "1 Hour", value: "3600" },
  { label: "24 Hours", value: "86400" },
  { label: "7 Days", value: "604800" },
];

export function SpendLimitForm({ walletAddress }: { walletAddress: string }) {
  const [token] = useState(NATIVE_XLM_CONTRACT_ID);
  const [amount, setAmount] = useState("");
  const [window, setWindow] = useState("86400");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setShowPasskey(true);
    setIsProcessing(true);

    try {
      // Get assertion options for the passkey signing step
      const optsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle: walletAddress }),
      });
      if (!optsRes.ok) throw new Error("Failed to get passkey options");
      const options = await optsRes.json();

      // User authenticates
      const assertionResponse = await startAuthentication(options);

      // Create session key via SDK with the spend limit encoded
      await walletSdk.createSessionKey(walletAddress, {
        publicKey: new Uint8Array(Buffer.from(assertionResponse.response.authenticatorData, "base64")),
        expiresAt: Math.floor(Date.now() / 1000) + parseInt(window),
        spendLimit: {
          assetContract: token,
          amount: BigInt(Math.round(parseFloat(amount) * 10_000_000)), // stroops
          timeframeSeconds: parseInt(window),
        },
      });

      setSaved(true);
      setAmount("");
      toast.success("Spend limit set on-chain");
    } catch (err: any) {
      toast.error(err.message || "Failed to set spend limit");
    } finally {
      setIsProcessing(false);
      setShowPasskey(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle>Set Spend Limit</CardTitle>
          <CardDescription>
            Configure a rolling cap enforced by the smart contract policy module.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {showPasskey ? (
            <PasskeyPrompt isProcessing={isProcessing} message="Sign policy update with your passkey…" />
          ) : (
            <>
              <div className="space-y-2">
                <Label>Asset</Label>
                <Select value={token} items={{ [NATIVE_XLM_CONTRACT_ID]: "XLM (Native)" }} disabled>
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
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          {!showPasskey && (
            <Button type="submit" size="lg" disabled={!amount || isProcessing} className="w-full">
              {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Setting…</> : "Set Spend Limit"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
