"use client";

import { useState } from "react";
import { useSendTransaction, isStellarAddress, toStroops } from "@/hooks/useWallet";
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

interface QuickSendProps {
  walletAddress: string;
  credentialId: string;
  disabled?: boolean;
}

/**
 * Send XLM from the smart wallet. The SDK builds the Soroban transfer, the
 * passkey signs the wallet's authorisation entry (contract-verified WebAuthn
 * signature), and the relay pays the fee. The hash shown is the real one.
 */
export function QuickSend({ walletAddress, credentialId, disabled }: QuickSendProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "passkey" | "submitted">("form");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | undefined>();

  const send = useSendTransaction();
  const { data: txStatus } = useTransactionStatus(txHash);

  const recipientValid = isStellarAddress(recipient);
  const amountValid = (() => {
    try {
      return amount.trim() !== "" && toStroops(amount) > 0n;
    } catch {
      return false;
    }
  })();

  const executeSend = async () => {
    setStep("passkey");
    try {
      const result = await send.mutateAsync({
        walletAddress,
        credentialId,
        to: recipient.trim(),
        amount: amount.trim(),
      });
      setTxHash(result.txHash);
      setStep("submitted");
      toast.success("Transaction confirmed on Stellar testnet");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send transaction");
      setStep("form");
    }
  };

  const handleClose = (v: boolean) => {
    if (!v && send.isPending) return;
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
      <DialogTrigger
        render={
          <Button className="flex-1" disabled={disabled}>
            <ArrowUpRight data-icon="inline-start" /> Send
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send XLM</DialogTitle>
          <DialogDescription>Send XLM to any Stellar account (G…) or contract (C…) on testnet.</DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="G… or C…"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value.toUpperCase())}
                className="font-mono text-sm"
                aria-invalid={recipient.length > 0 && !recipientValid}
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
            <p className="text-xs text-muted-foreground">
              You&apos;ll confirm with your passkey. The relay sponsors the network fee.
            </p>
          </div>
        )}

        {step === "passkey" && (
          <div className="py-4">
            <PasskeyPrompt
              isProcessing
              message="Sign this transaction with your passkey, then we submit it to Stellar…"
            />
          </div>
        )}

        {step === "submitted" && (
          <div className="py-8 flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/12 text-success ring-1 ring-success/30">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <p className="font-semibold text-lg">Sent {amount} XLM</p>
              <p className="text-sm text-muted-foreground mt-1">Verified on-chain by your wallet contract.</p>
            </div>
            {txHash && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={txStatus?.status === "success" ? "default" : "secondary"}>
                    {txStatus?.status ?? "success"}
                  </Badge>
                </div>
                <code className="block text-xs font-mono break-all text-muted-foreground mb-2">{txHash}</code>
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
            <Button onClick={executeSend} disabled={!recipientValid || !amountValid} className="w-full">
              Sign & Send
            </Button>
          )}
          {step === "passkey" && (
            <Button disabled className="w-full">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Waiting for signature…
            </Button>
          )}
          {step === "submitted" && (
            <Button onClick={() => handleClose(false)} variant="outline" className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
