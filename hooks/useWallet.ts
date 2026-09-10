import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletSdk } from "@/lib/sdk-client";

// The native XLM token contract ID on testnet
export const NATIVE_XLM_CONTRACT_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export interface WalletBalances {
  [contractId: string]: bigint;
}

export interface WalletData {
  address: string;
  signers: Array<{ publicKeyBytes: Uint8Array; weight: number }>;
  balances: WalletBalances;
}

export function useWallet(walletAddress?: string, tokens: string[] = [NATIVE_XLM_CONTRACT_ID]) {
  const query = useQuery({
    queryKey: ["wallet", walletAddress, tokens],
    queryFn: async (): Promise<WalletData | null> => {
      if (!walletAddress) return null;

      const states = await Promise.all(
        tokens.map((contractId) =>
          walletSdk.getWalletState(walletAddress, { contractId })
        )
      );

      const signers = states.length > 0 ? states[0].signers : [];
      const balances: WalletBalances = tokens.reduce((acc, contractId, index) => {
        acc[contractId] = states[index].balance;
        return acc;
      }, {} as WalletBalances);

      return { address: walletAddress, signers, balances };
    },
    enabled: !!walletAddress && tokens.length > 0,
    staleTime: 30_000,
    retry: 1,
  });

  const sendTransaction = useMutation({
    mutationFn: async ({
      xdr,
      challenge,
      credentialId,
    }: {
      xdr: string;
      challenge: string;
      credentialId: string;
    }) => {
      return walletSdk.signAndSubmit(xdr, { challenge, credentialId });
    },
  });

  return {
    ...query,
    sendTransaction,
  };
}

// Format raw balance (bigint in stroops) to human-readable
export function formatXLM(stroops?: bigint): string {
  if (stroops === undefined || stroops === null) return "0.00";
  return (Number(stroops) / 10_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}
