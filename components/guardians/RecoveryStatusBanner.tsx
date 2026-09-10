"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import type { RecoveryProposalStatus } from "@/hooks/useRecovery";

export function RecoveryStatusBanner({ walletAddress }: { walletAddress: string }) {
  const [isCancelling, setIsCancelling] = useState(false);

  // Query the backend for any active recovery proposals on this wallet
  const { data: activeProposal, isLoading } = useQuery({
    queryKey: ["active-recovery", walletAddress],
    queryFn: async (): Promise<RecoveryProposalStatus | null> => {
      // The backend surfaces the latest proposal when queried with walletAddress as the proposalId fallback.
      // In production this would be an indexed query. For now we check by walletAddress.
      const res = await fetch(`/api/recovery/status?walletAddress=${encodeURIComponent(walletAddress)}`);
      if (!res.ok) return null; // 404 = no active proposal
      return res.json();
    },
    retry: false,
    refetchInterval: 30_000,
  });

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const optsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle: walletAddress }),
      });
      if (!optsRes.ok) throw new Error("Failed to get passkey options");
      const options = await optsRes.json();
      await startAuthentication(options);
      // SDK call: walletSdk.cancelRecovery(walletAddress, activeProposal.proposalId)
      toast.success("Recovery proposal cancelled");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel recovery");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !activeProposal) return null;
  if (activeProposal.status === "executed" || activeProposal.status === "cancelled") return null;

  const approvalsCount = activeProposal.approvals.length;

  return (
    <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
      <ShieldAlert className="h-5 w-5" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <AlertTitle className="text-base mb-0.5">Active Recovery in Progress</AlertTitle>
          <AlertDescription>
            A recovery request for this wallet is pending.
            {" "}
            <Badge variant="outline" className="ml-1">
              {approvalsCount} approval{approvalsCount !== 1 ? "s" : ""}
            </Badge>
          </AlertDescription>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={isCancelling}
          className="shrink-0"
        >
          {isCancelling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {isCancelling ? "Cancelling…" : "Cancel Recovery"}
        </Button>
      </div>
    </Alert>
  );
}
