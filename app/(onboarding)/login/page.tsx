"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { walletSdk } from "@/lib/sdk-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";
import { toast } from "sonner";
import { Fingerprint, Loader2 } from "lucide-react";

/**
 * Sign in with a passkey:
 *   relay challenge → discoverable passkey assertion → relay verifies the
 *   signature against the stored public key → credential id → wallet address.
 */
export default function LoginPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    setIsProcessing(true);
    try {
      // Challenges are scoped per handle on the relay; a random one is fine for
      // discoverable-credential sign-in (the passkey itself identifies the user).
      const userHandle = crypto.randomUUID();

      const optsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle }),
      });
      if (!optsRes.ok) throw new Error("Relay is unreachable — could not fetch sign-in options");
      const options = await optsRes.json();

      // Browser passkey picker (Windows Hello / Touch ID / Face ID)
      const assertion = await walletSdk.getAssertion({ challenge: options.challenge, rpId: options.rpId });

      const verifyRes = await fetch("/api/webauthn/assert/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle, response: assertion }),
      });
      const verify = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok || !verify.verified) {
        throw new Error(verify.message || "Passkey verification failed");
      }

      const walletRes = await fetch(`/api/wallets/${encodeURIComponent(assertion.id)}`);
      if (!walletRes.ok) throw new Error("No wallet found for this passkey — create one first");
      const { walletAddress } = await walletRes.json();

      await loginAction(walletAddress, assertion.id);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Login failed");
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full gap-6 border-0 bg-transparent py-0 ring-0 shadow-none!">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl sm:text-3xl">Welcome back</CardTitle>
        <CardDescription>Access your Guardian Wallet using your passkey.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pt-2">
        <PasskeyPrompt isProcessing={isProcessing} message="Ready to authenticate..." />
      </CardContent>
      <CardFooter className="border-0 bg-transparent px-0 pb-0 flex flex-col gap-2">
        <Button size="lg" className="w-full" onClick={handleLogin} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" /> Signing in…
            </>
          ) : (
            <>
              <Fingerprint data-icon="inline-start" /> Sign in with Passkey
            </>
          )}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => router.push("/create")} disabled={isProcessing}>
          Create a new wallet instead
        </Button>
      </CardFooter>
    </Card>
  );
}
