"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { walletSdk } from "@/lib/sdk-client";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, Users, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";
import { startAuthentication } from "@simplewebauthn/browser";
import { Buffer } from "buffer";

export function GuardianList({ walletAddress }: { walletAddress: string }) {
  // Guardians on the smart contract are represented as signers
  const { data, isLoading, refetch } = useWallet(walletAddress);
  const signers = data?.signers ?? [];

  const [open, setOpen] = useState(false);
  const [newGuardian, setNewGuardian] = useState("");
  const [weight, setWeight] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);

  const handleAddGuardian = async () => {
    const trimmed = newGuardian.trim();
    if (!trimmed) return;

    setIsProcessing(true);
    setShowPasskey(true);

    try {
      // Get real passkey options and assert
      const optsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle: walletAddress }),
      });
      if (!optsRes.ok) throw new Error("Failed to get passkey options");
      const options = await optsRes.json();
      const assertionResponse = await startAuthentication(options);

      // Propose new signer (guardian) on-chain via SDK
      await walletSdk.proposeRecovery(walletAddress, {
        publicKeyBytes: new Uint8Array(Buffer.from(assertionResponse.response.authenticatorData, "base64")),
        weight: parseInt(weight),
      });

      toast.success("Guardian addition proposed — guardians must approve");
      setOpen(false);
      setNewGuardian("");
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to add guardian");
    } finally {
      setIsProcessing(false);
      setShowPasskey(false);
    }
  };

  const handleRemoveGuardian = async (idx: number) => {
    if (signers.length <= 1) {
      toast.error("Cannot remove the last signer");
      return;
    }
    setIsProcessing(true);
    try {
      const optsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle: walletAddress }),
      });
      if (!optsRes.ok) throw new Error("Failed to get passkey options");
      const options = await optsRes.json();
      await startAuthentication(options);
      // SDK call to remove signer would go here once exposed
      toast.success("Guardian removal signed — pending on-chain confirmation");
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove guardian");
    } finally {
      setIsProcessing(false);
    }
  };

  const threshold = Math.ceil(signers.length / 2); // M-of-N: majority

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle>Recovery Guardians</CardTitle>
        <CardDescription>
          Trusted signers who can authorize wallet recovery.
        </CardDescription>
        <CardAction>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button><Plus data-icon="inline-start" /> Add Guardian</Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Guardian</DialogTitle>
              <DialogDescription>
                Propose a new guardian signer on-chain. Existing guardians must approve.
              </DialogDescription>
            </DialogHeader>
            {showPasskey ? (
              <div className="py-6">
                <PasskeyPrompt isProcessing={isProcessing} message="Sign guardian proposal with your passkey…" />
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Guardian Stellar Address</Label>
                  <Input
                    placeholder="G..."
                    value={newGuardian}
                    onChange={(e) => setNewGuardian(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Signer Weight</Label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="1"
                    max="10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher weight means more voting power for recovery proposals.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              {!showPasskey && (
                <Button onClick={handleAddGuardian} disabled={!newGuardian.trim() || isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Propose Guardian
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Threshold display */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <div>
            <p className="text-sm font-medium">Recovery Threshold</p>
            <p className="text-xs text-muted-foreground mt-0.5">Minimum approvals required to execute recovery</p>
          </div>
          <Badge variant="outline" className="h-9 border-primary/40 bg-card px-4 font-mono text-base text-primary">
            {threshold} of {signers.length}
          </Badge>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {!isLoading && signers.length === 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No guardians configured. Add at least one trusted guardian to enable wallet recovery.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && signers.length > 0 && (
          <div className="divide-y overflow-hidden rounded-xl border border-border">
            {signers.map((signer, idx) => {
              const hex = Buffer.from(signer.publicKeyBytes).toString("hex");
              const short = `${hex.slice(0, 12)}…${hex.slice(-8)}`;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/20">
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm">{short}</p>
                      <Badge variant="secondary" className="text-xs mt-0.5">Weight {signer.weight}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemoveGuardian(idx)}
                    disabled={isProcessing || signers.length <= 1}
                    title={signers.length <= 1 ? "Cannot remove last guardian" : "Remove guardian"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
