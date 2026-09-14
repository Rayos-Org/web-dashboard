import { useQuery } from "@tanstack/react-query";
import type { Transfer } from "@rayos/wallet-sdk";
import { walletSdk } from "@/lib/sdk-client";
import { walletKeys } from "./useWallet";

export type { Transfer };

/** Native-token transfers touching the wallet, from Soroban RPC events. */
export function useTransactions(walletAddress?: string) {
  return useQuery({
    queryKey: walletKeys.transfers(walletAddress),
    queryFn: () => walletSdk.getRecentTransfers(walletAddress!, 25),
    enabled: !!walletAddress,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useTransactionStatus(txHash?: string) {
  return useQuery({
    queryKey: ["txStatus", txHash],
    queryFn: () => walletSdk.getTransactionStatus(txHash!),
    enabled: !!txHash,
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 3000 : false),
  });
}
