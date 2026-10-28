"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RecoveryProposalStatus } from "@/hooks/useRecovery";
import { useCancelRecovery } from "@/hooks/usePolicies";

export function RecoveryStatusBanner({
  walletAddress,
  credentialId,
}: {
  walletAddress: string;
  credentialId?: string;
}) {
  // Query the backend for any active recovery proposals on this wallet
  const { data: activeProposal, isLoading } = useQuery({
    queryKey: ["active-recovery", walletAddress],
    queryFn: async (): Promise<RecoveryProposalStatus | null> => {
      const res = await fetch(`/api/recovery/status?walletAddress=${encodeURIComponent(walletAddress)}`);
      if (!res.ok) return null; // 404 = no active proposal
      return res.json();
    },
    retry: false,
    refetchInterval: 30_000,
  });

  const cancelMutation = useCancelRecovery();

  const handleCancel = async () => {
    if (!activeProposal) return;
    if (!credentialId) {
      toast.error("Passkey credential required to cancel recovery. Please log in again.");
      return;
    }

    try {
      toast.info("Please verify the passkey prompt to cancel recovery...");
      const res = await cancelMutation.mutateAsync({
        walletAddress,
        proposalId: BigInt(activeProposal.proposalId),
        credentialId,
      });
      toast.success("Recovery proposal cancelled on-chain", {
        description: `Tx: ${res.txHash.slice(0, 10)}...`,
      });
    } catch (err: any) {
      toast.error("Failed to cancel recovery", {
        description: err?.message || "An unexpected error occurred",
      });
    }
  };

  if (isLoading || !activeProposal) return null;
  if (activeProposal.status === "executed" || activeProposal.status === "cancelled") return null;

  const approvalsCount = activeProposal.approvals.length;

  return (
    <Alert variant="destructive" className="border-destructive/40 bg-destructive/8 shadow-elevated">
      <ShieldAlert className="size-5" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <AlertTitle className="text-base mb-0.5">Active Recovery in Progress</AlertTitle>
          <AlertDescription>
            A recovery request for this wallet is pending.{" "}
            <Badge variant="outline" className="ml-1 border-destructive/40 text-destructive">
              {approvalsCount} approval{approvalsCount !== 1 ? "s" : ""}
            </Badge>
          </AlertDescription>
        </div>
        <Button
          variant="destructive"
          onClick={handleCancel}
          disabled={cancelMutation.isPending}
          className="shrink-0"
        >
          {cancelMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            "Cancel Recovery"
          )}
        </Button>
      </div>
    </Alert>
  );
}
