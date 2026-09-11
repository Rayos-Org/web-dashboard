"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useTransactionStatus } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PasskeyPrompt } from "./PasskeyPrompt";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startAuthentication } from "@simplewebauthn/browser";

interface QuickSendProps {
  walletAddress: string;
}

export function QuickSend({ walletAddress }: QuickSendProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "passkey" | "submitted">("form");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();

  const { sendTransaction } = useWallet(walletAddress);
  const { data: txStatus } = useTransactionStatus(txHash);

  const handleSendRequest = () => {
    if (!recipient.trim() || !amount.trim()) return;
    setStep("passkey");
  };

  const executeSend = async () => {
    setIsProcessing(true);
    try {
      // 1. Get assertion options from backend to sign the transaction
      const optsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle: walletAddress }),
      });
      if (!optsRes.ok) throw new Error("Failed to get assertion options");
      const options = await optsRes.json();

      // 2. Browser prompts user — real passkey interaction
      const assertionResponse = await startAuthentication(options);

      // 3. Submit signed transaction through the SDK
      // The SDK builds the XDR from the wallet address, recipient and amount,
      // signs it with the assertion, and submits via relay.
      const result = await sendTransaction.mutateAsync({
        xdr: JSON.stringify({ to: recipient, amount, asset: "native" }), // SDK encodes this
        challenge: options.challenge,
        credentialId: assertionResponse.id,
      });

      setTxHash(result.hash);
      setStep("submitted");
      toast.success("Transaction submitted to relay");
    } catch (err: any) {
      toast.error(err.message || "Failed to send transaction");
      setStep("form");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setTimeout(() => {
        setStep("form");
        setRecipient("");
        setAmount("");
        setTxHash(undefined);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger render={
        <Button className="flex-1">
          <ArrowUpRight data-icon="inline-start" /> Send
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send XLM</DialogTitle>
          <DialogDescription>Send XLM to any Stellar address.</DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="G..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (XLM)</Label>
              <Input
                id="amount"
                type="number"
                min="0.0000001"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === "passkey" && (
          <div className="py-4">
            <PasskeyPrompt isProcessing={isProcessing} message="Sign this transaction with your passkey" />
          </div>
        )}

        {step === "submitted" && (
          <div className="py-8 flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/12 text-success ring-1 ring-success/30">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <p className="font-semibold text-lg">Submitted!</p>
              <p className="text-sm text-muted-foreground mt-1">Your transaction is being relayed.</p>
            </div>
            {txHash && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={txStatus?.status === "success" ? "default" : "secondary"}>
                    {txStatus?.status ?? "pending"}
                  </Badge>
                </div>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-4"
                >
                  View on Stellar Expert ↗
                </a>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "form" && (
            <Button
              onClick={handleSendRequest}
              disabled={!recipient.trim() || !amount.trim()}
              className="w-full"
            >
              Continue
            </Button>
          )}
          {step === "passkey" && (
            <div className="flex gap-2 w-full">
              <Button variant="ghost" onClick={() => setStep("form")} disabled={isProcessing} className="flex-1">
                Back
              </Button>
              <Button onClick={executeSend} disabled={isProcessing} className="flex-1">
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing…</> : "Sign & Send"}
              </Button>
            </div>
          )}
          {step === "submitted" && (
            <Button onClick={() => handleClose(false)} variant="outline" className="w-full">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
