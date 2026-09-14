import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Signer, WalletState } from "@rayos/wallet-sdk";
import { walletSdk } from "@/lib/sdk-client";

/** Native XLM Stellar Asset Contract on testnet. */
export const NATIVE_XLM_CONTRACT_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export type { Signer, WalletState };

export const walletKeys = {
  state: (addr?: string) => ["wallet", addr] as const,
  transfers: (addr?: string) => ["transfers", addr] as const,
};

/** Signers + native balance read from the wallet contract over Soroban RPC. */
export function useWallet(walletAddress?: string) {
  return useQuery({
    queryKey: walletKeys.state(walletAddress),
    queryFn: () => walletSdk.getWalletState(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 15_000,
    retry: 1,
  });
}

export interface SendParams {
  walletAddress: string;
  credentialId: string;
  to: string;
  /** Decimal XLM string, e.g. "12.5" */
  amount: string;
}

/**
 * Send XLM: the SDK builds the transfer, the passkey authorises it (Windows
 * Hello / Touch ID prompt), and the relay pays the fee and submits it.
 */
export function useSendTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ walletAddress, credentialId, to, amount }: SendParams) =>
      walletSdk.transfer({ walletAddress, to, amount: toStroops(amount), credentialId }),
    onSuccess: (_res, { walletAddress }) => {
      qc.invalidateQueries({ queryKey: walletKeys.state(walletAddress) });
      qc.invalidateQueries({ queryKey: walletKeys.transfers(walletAddress) });
    },
  });
}

/** Testnet: relay sends XLM to the wallet. */
export function useFaucet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (walletAddress: string) => walletSdk.requestFaucet(walletAddress),
    onSuccess: (_res, walletAddress) => {
      qc.invalidateQueries({ queryKey: walletKeys.state(walletAddress) });
      qc.invalidateQueries({ queryKey: walletKeys.transfers(walletAddress) });
    },
  });
}

/** Stroops (bigint) → human readable XLM. */
export function formatXLM(stroops?: bigint | null): string {
  if (stroops === undefined || stroops === null) return "0.00";
  return (Number(stroops) / 10_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

/** Decimal XLM string → stroops. */
export function toStroops(xlm: string): bigint {
  const [whole = "0", frac = ""] = xlm.trim().split(".");
  if (!/^\d*$/.test(whole) || !/^\d*$/.test(frac)) throw new Error("Invalid amount");
  return BigInt(whole || "0") * 10_000_000n + BigInt((frac + "0000000").slice(0, 7));
}

export function isStellarAddress(value: string): boolean {
  return /^[GC][A-Z2-7]{55}$/.test(value.trim());
}
