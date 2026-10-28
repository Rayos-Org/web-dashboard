import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletSdk } from "@/lib/sdk-client";
import { NATIVE_XLM_CONTRACT_ID } from "@/hooks/useWallet";
import type { SpendLimit } from "@rayos/wallet-sdk";

export type { SpendLimit };

// On-Chain Spend Limits
export function useSpendLimit(walletAddress?: string, tokenAddress: string = NATIVE_XLM_CONTRACT_ID) {
  return useQuery({
    queryKey: ["spend-limit", walletAddress, tokenAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      return walletSdk.getSpendLimit(walletAddress, tokenAddress);
    },
    enabled: !!walletAddress,
    staleTime: 30_000,
  });
}

export function useSetSpendLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      walletAddress: string;
      tokenAddress: string;
      amount: bigint;
      windowSecs: bigint;
      credentialId: string;
    }) => {
      return walletSdk.setSpendLimit(params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["spend-limit", variables.walletAddress, variables.tokenAddress],
      });
    },
  });
}

// On-Chain Guardian Policy
export function useAddGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      walletAddress: string;
      guardianAddress: string;
      credentialId: string;
    }) => {
      return walletSdk.addGuardian(params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wallet", variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["guardians", variables.walletAddress] });
    },
  });
}

export function useRemoveGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      walletAddress: string;
      guardianAddress: string;
      credentialId: string;
    }) => {
      return walletSdk.removeGuardian(params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wallet", variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["guardians", variables.walletAddress] });
    },
  });
}

export function useCancelRecovery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      walletAddress: string;
      proposalId: bigint;
      credentialId: string;
    }) => {
      return walletSdk.cancelRecovery(params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["active-recovery", variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["recovery"] });
    },
  });
}

// Types matching the backend schemas exactly
export interface SessionKey {
  sessionId: string;
  walletAddress: string;
  scope: string;
  expiresAt: string;
  createdAt: string;
}

// Session Keys
export function useSessionKeys(walletAddress?: string) {
  return useQuery({
    queryKey: ["sessions", walletAddress],
    queryFn: async (): Promise<SessionKey[]> => {
      if (!walletAddress) return [];
      const res = await fetch(`/api/sessions?walletAddress=${encodeURIComponent(walletAddress)}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    enabled: !!walletAddress,
  });
}

export function useCreateSessionKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      walletAddress: string;
      scope: string;
      expiresAt: string;
      signature: string;
    }) => {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create session key");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessions", variables.walletAddress] });
    },
  });
}

export function useRevokeSessionKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, walletAddress }: { id: string; walletAddress: string }) => {
      const res = await fetch(
        `/api/sessions/${id}?walletAddress=${encodeURIComponent(walletAddress)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to revoke session key");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessions", variables.walletAddress] });
    },
  });
}
