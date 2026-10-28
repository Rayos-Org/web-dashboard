"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useAddGuardian, useRemoveGuardian } from "@/hooks/usePolicies";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, AlertTriangle, ExternalLink, ShieldCheck, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

function isValidStellarAddress(addr: string): boolean {
  return /^[GC][A-Z2-7]{55}$/.test(addr.trim());
}

/**
 * Recovery guardians manage social recovery and multisig thresholds for the wallet.
 * Every addition or removal is authorized on-chain via passkey invocation on the PolicyModule.
 */
export function GuardianList({
  walletAddress,
  credentialId,
}: {
  walletAddress: string;
  credentialId?: string;
}) {
  const { data, isLoading } = useWallet(walletAddress);
  const addGuardianMutation = useAddGuardian();
  const removeGuardianMutation = useRemoveGuardian();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGuardianAddress, setNewGuardianAddress] = useState("");
  const [customGuardians, setCustomGuardians] = useState<string[]>([]);
  const [removingAddress, setRemovingAddress] = useState<string | null>(null);

  const signers = data?.signers ?? [];
  const totalGuardians = signers.length + customGuardians.length;
  const threshold = totalGuardians === 0 ? 0 : Math.max(1, Math.ceil(totalGuardians / 2));

  const handleAddGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAddr = newGuardianAddress.trim();

    if (!isValidStellarAddress(targetAddr)) {
      toast.error("Invalid Stellar address", {
        description: "Address must be a valid 56-character Account (G...) or Contract (C...) ID.",
      });
      return;
    }

    if (!credentialId) {
      toast.error("Passkey credential required. Please log in again.");
      return;
    }

    try {
      toast.info("Please verify your passkey to authorize adding guardian...");
      const res = await addGuardianMutation.mutateAsync({
        walletAddress,
        guardianAddress: targetAddr,
        credentialId,
      });

      toast.success(
        <div>
          <p className="font-medium">Guardian successfully added on-chain!</p>
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

      if (!customGuardians.includes(targetAddr)) {
        setCustomGuardians((prev) => [...prev, targetAddr]);
      }
      setNewGuardianAddress("");
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add guardian on-chain");
    }
  };

  const handleRemoveGuardian = async (targetAddr: string) => {
    if (!credentialId) {
      toast.error("Passkey credential required. Please log in again.");
      return;
    }

    setRemovingAddress(targetAddr);
    try {
      toast.info("Please verify your passkey to authorize removing guardian...");
      const res = await removeGuardianMutation.mutateAsync({
        walletAddress,
        guardianAddress: targetAddr,
        credentialId,
      });

      toast.success(
        <div>
          <p className="font-medium">Guardian removed successfully!</p>
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

      setCustomGuardians((prev) => prev.filter((a) => a !== targetAddr));
    } catch (err: any) {
      toast.error(err.message || "Failed to remove guardian");
    } finally {
      setRemovingAddress(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b pb-6">
          <div className="flex items-center gap-2.5">
            <CardTitle>Recovery Guardians</CardTitle>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 font-medium">
              Policy Active
            </Badge>
          </div>
          <CardDescription>
            Trusted signers and guardian accounts authorized on-chain to approve wallet recovery.
          </CardDescription>
          <CardAction>
            <Button onClick={() => setIsDialogOpen(true)}>
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
              {threshold} of {totalGuardians}
            </Badge>
          </div>

          <Alert className="border-primary/20 bg-primary/5">
            <ShieldCheck className="text-primary shrink-0" />
            <AlertDescription className="text-sm">
              <span className="font-semibold text-foreground">On-Chain Policy Active:</span> Recovery guardians and spend limits are secured by the PolicyModule contract on Stellar Testnet. When a recovery is initiated, guardians approve the proposal on-chain before access can be transferred.
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

          {!isLoading && (signers.length > 0 || customGuardians.length > 0) && (
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

              {customGuardians.map((addr) => (
                <div
                  key={addr}
                  className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/20">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm" title={addr}>
                        {addr.slice(0, 12)}…{addr.slice(-6)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Policy Guardian · On-Chain</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${addr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0 p-2"
                      title="View on Stellar Expert"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveGuardian(addr)}
                      disabled={removingAddress === addr || removeGuardianMutation.isPending}
                      title="Remove guardian"
                    >
                      {removingAddress === addr ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Recovery Guardian</DialogTitle>
            <DialogDescription>
              Guardians are authorized Stellar accounts (G...) or smart contracts (C...) that can approve recovery proposals when passkeys are lost.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddGuardian} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guardian-addr">Guardian Stellar Address</Label>
              <Input
                id="guardian-addr"
                placeholder="G... or C..."
                value={newGuardianAddress}
                onChange={(e) => setNewGuardianAddress(e.target.value)}
                className="font-mono text-sm"
                disabled={addGuardianMutation.isPending}
                required
              />
              <p className="text-xs text-muted-foreground">
                Requires passkey authorization to update your on-chain policy.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={addGuardianMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addGuardianMutation.isPending || !newGuardianAddress.trim()}
              >
                {addGuardianMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  "Authorize & Add"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
