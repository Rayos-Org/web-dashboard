import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_RELAY_BACKEND_URL: z.string().url(),
  NEXT_PUBLIC_WEBAUTHN_RP_ID: z.string().min(1),
  NEXT_PUBLIC_FACTORY_CONTRACT_ID: z.string().length(56),
  NEXT_PUBLIC_POLICY_CONTRACT_ID: z.string().length(56),
  NEXT_PUBLIC_SOROBAN_RPC_URL: z.string().url(),
  NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: z.string().min(1),
});

const processEnv = {
  NEXT_PUBLIC_RELAY_BACKEND_URL: process.env.NEXT_PUBLIC_RELAY_BACKEND_URL,
  NEXT_PUBLIC_WEBAUTHN_RP_ID: process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID,
  NEXT_PUBLIC_FACTORY_CONTRACT_ID: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID,
  NEXT_PUBLIC_POLICY_CONTRACT_ID: process.env.NEXT_PUBLIC_POLICY_CONTRACT_ID,
  NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
  NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const config = parsed.data;
