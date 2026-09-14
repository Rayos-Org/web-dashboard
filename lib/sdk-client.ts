import { WalletSdk } from "@rayos/wallet-sdk";
import { config } from "./config";

/**
 * Singleton Wallet SDK (browser). Relay calls go through the Next.js `/api`
 * proxy so the browser never talks cross-origin; Soroban RPC is called directly.
 */
export const walletSdk = new WalletSdk({
  networkPassphrase: config.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  rpcUrl: config.NEXT_PUBLIC_SOROBAN_RPC_URL,
  relayUrl: "/api",
  factoryContractId: config.NEXT_PUBLIC_FACTORY_CONTRACT_ID,
  rpId: config.NEXT_PUBLIC_WEBAUTHN_RP_ID,
});
