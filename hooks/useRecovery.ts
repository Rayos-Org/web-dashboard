import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface RecoveryProposalStatus {
  proposalId: string;
  status: "pending" | "approved" | "executed" | "cancelled" | "expired";
  timelockExpiresAt: string;
  approvals: Array<{ guardianAddress: string; approvedAt: string }>;
}

export function useRecoveryProposal(proposalId?: string) {
  return useQuery({
    queryKey: ["recovery", proposalId],
    queryFn: async (): Promise<RecoveryProposalStatus | null> => {
      if (!proposalId) return null;
      const res = await fetch(`/api/recovery/${proposalId}`);
      if (!res.ok) throw new Error("Failed to fetch recovery status");
      return res.json();
    },
    enabled: !!proposalId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "approved" ? 10_000 : false;
    },
  });
}

export function useProposeRecovery() {
  return useMutation({
    mutationFn: async (data: { walletAddress: string; newSigner: string }) => {
      const res = await fetch("/api/recovery/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to propose recovery");
      }
      return res.json();
    },
  });
}

export function useApproveRecovery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { walletAddress: string; proposalId: string }) => {
      const res = await fetch("/api/recovery/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to approve recovery");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["recovery", variables.proposalId] });
    },
  });
}
