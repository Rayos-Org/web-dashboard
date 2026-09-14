"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { RecoveryProposalStatus } from "@/hooks/useRecovery";

export function RecoveryStatusBanner({ walletAddress }: { walletAddress: string }) {
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

  // Cancelling a proposal calls the PolicyModule (owner-gated on testnet);
  // until that ships, the banner is informational only.
  const handleCancel = () => {
    toast.info("Cancel recovery lands with the next PolicyModule release");
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
            A recovery request for this wallet is pending.
            {" "}
            <Badge variant="outline" className="ml-1 border-destructive/40 text-destructive">
              {approvalsCount} approval{approvalsCount !== 1 ? "s" : ""}
            </Badge>
          </AlertDescription>
        </div>
        <Button
          variant="destructive"
          onClick={handleCancel}
          className="shrink-0"
        >
          Cancel Recovery
        </Button>
      </div>
    </Alert>
  );
}
