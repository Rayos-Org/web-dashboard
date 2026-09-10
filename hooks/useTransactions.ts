import { useQuery } from "@tanstack/react-query";

export interface HorizonOperation {
  id: string;
  type: string;
  created_at: string;
  transaction_hash: string;
  from?: string;
  to?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  starting_balance?: string;
  source_account?: string;
  account?: string;
}

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";

export function useTransactions(walletAddress?: string) {
  return useQuery({
    queryKey: ["transactions", walletAddress],
    queryFn: async (): Promise<HorizonOperation[]> => {
      if (!walletAddress) return [];
      const res = await fetch(
        `${HORIZON_TESTNET}/accounts/${walletAddress}/operations?limit=20&order=desc`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) {
        // Account may not exist yet (unfunded) — return empty rather than throw
        if (res.status === 404) return [];
        throw new Error(`Horizon returned ${res.status}`);
      }
      const json = await res.json();
      return (json._embedded?.records ?? []) as HorizonOperation[];
    },
    enabled: !!walletAddress,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useTransactionStatus(txHash?: string) {
  return useQuery({
    queryKey: ["txStatus", txHash],
    queryFn: async () => {
      if (!txHash) return null;
      const res = await fetch(`/api/relay/status/${txHash}`);
      if (!res.ok) throw new Error("Failed to fetch tx status");
      return res.json();
    },
    enabled: !!txHash,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" ? 3000 : false;
    },
  });
}

export function useAccountExists(walletAddress?: string) {
  return useQuery({
    queryKey: ["accountExists", walletAddress],
    queryFn: async (): Promise<boolean> => {
      if (!walletAddress) return false;
      const res = await fetch(
        `${HORIZON_TESTNET}/accounts/${walletAddress}`,
        { headers: { Accept: "application/json" } }
      );
      return res.ok;
    },
    enabled: !!walletAddress,
  });
}
