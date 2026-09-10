import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
