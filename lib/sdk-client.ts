import { WalletSdk } from "@rayos/wallet-sdk";
import { config } from "./config";

// Singleton instance of the Wallet SDK
export const walletSdk = new WalletSdk({
  networkPassphrase: config.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  rpcUrl: config.NEXT_PUBLIC_SOROBAN_RPC_URL,
  relayUrl: config.NEXT_PUBLIC_RELAY_BACKEND_URL,
});
