"use client";

import { useState, use } from "react";
import { useApproveRecovery, useRecoveryProposal } from "@/hooks/useRecovery";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";
import { ShieldCheck, Loader2, Clock } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";

export default function ApproveRecoveryPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = use(params);
  const { data: proposalStatus, isLoading } = useRecoveryProposal(proposalId);
  const approveRecovery = useApproveRecovery();

  const [walletAddress, setWalletAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [done, setDone] = useState(false);

  const handleApprove = async () => {
    if (!walletAddress.trim() || walletAddress.trim().length !== 56) {
      toast.error("Enter a valid 56-character Stellar wallet address");
      return;
    }

    setIsProcessing(true);
    setShowPasskey(true);

    try {
      // Guardian signs with their passkey
      const optsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle: walletAddress.trim() }),
      });
      if (!optsRes.ok) throw new Error("Failed to get passkey options");
      const options = await optsRes.json();
      await startAuthentication(options);

      // Submit the real approval to backend
      await approveRecovery.mutateAsync({
        walletAddress: walletAddress.trim(),
        proposalId,
      });

      setDone(true);
      toast.success("Approval submitted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve recovery");
    } finally {
      setIsProcessing(false);
      setShowPasskey(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center w-full">
        <div className="flex size-20 items-center justify-center rounded-full bg-success/12 text-success ring-1 ring-success/30">
          <ShieldCheck className="size-10" />
        </div>
        <h2 className="text-2xl font-bold">Approval Submitted</h2>
        <p className="text-muted-foreground max-w-sm">
          Your approval has been recorded on-chain. The wallet owner will be notified once the threshold is met.
        </p>
        <Badge variant="outline" className="text-sm px-4 py-1">You can close this page</Badge>
      </div>
    );
  }

  return (
    <Card className="w-full gap-6 border-0 bg-transparent py-0 ring-0 shadow-none!">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl sm:text-3xl">Guardian Approval</CardTitle>
        <CardDescription>
          You have been asked to approve a wallet recovery as a trusted guardian.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-5">
        {/* Proposal summary */}
        <div className="divide-y rounded-xl border border-border bg-muted/40">
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground font-medium">Proposal ID</span>
            <code className="font-mono text-xs truncate max-w-[180px]">{proposalId}</code>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground font-medium">Status</span>
            <Badge variant="secondary" className="capitalize">
              {proposalStatus?.status ?? "unknown"}
            </Badge>
          </div>
          {proposalStatus?.approvals && proposalStatus.approvals.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground font-medium">Approvals</span>
              <span>{proposalStatus.approvals.length} collected</span>
            </div>
          )}
          {proposalStatus?.timelockExpiresAt && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Timelock expires: {new Date(proposalStatus.timelockExpiresAt).toLocaleString()}
            </div>
          )}
        </div>

        {proposalStatus?.status !== "pending" && (
          <Alert>
            <AlertDescription>
              This proposal is <strong>{proposalStatus?.status}</strong> and no longer needs approval.
            </AlertDescription>
          </Alert>
        )}

        {showPasskey ? (
          <PasskeyPrompt isProcessing={isProcessing} message="Sign your approval with your passkey…" />
        ) : (
          <div className="space-y-2">
            <Label>Your Wallet Address (Guardian)</Label>
            <Input
              placeholder="G... (your 56-character Stellar address)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This is used to look up your passkey for signing.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-0 bg-transparent px-0 pb-0 pt-4">
        {!showPasskey && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleApprove}
            disabled={
              !walletAddress.trim() ||
              isProcessing ||
              proposalStatus?.status !== "pending"
            }
          >
            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Sign & Approve Recovery
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
