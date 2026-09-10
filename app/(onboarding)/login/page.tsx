"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";
import { toast } from "sonner";
import { startAuthentication } from "@simplewebauthn/browser";

export default function LoginPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    setIsProcessing(true);
    
    try {
      // 1. Get assertion options from relay backend
      const optsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Discoverable credential, no userHandle needed upfront
      });
      
      if (!optsRes.ok) throw new Error("Failed to fetch assertion options");
      const options = await optsRes.json();
      
      // 2. Browser prompts user for passkey (Touch ID, Face ID, etc.)
      const assertionResponse = await startAuthentication(options);
      
      // 3. Verify assertion with backend
      const verifyRes = await fetch("/api/webauthn/assert/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: assertionResponse }),
      });
      
      if (!verifyRes.ok) throw new Error("Verification failed");
      const { verified } = await verifyRes.json();
      
      if (!verified) throw new Error("Invalid signature");
      
      const credentialId = assertionResponse.id;

      // 4. Resolve credentialId to wallet address via indexer
      const walletRes = await fetch(`/api/wallets/${credentialId}`);
      if (!walletRes.ok) throw new Error("Wallet not found for this passkey");
      
      const { walletAddress } = await walletRes.json();
      
      // 5. Create session cookie and redirect to dashboard
      await loginAction(walletAddress, credentialId);
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Login failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-0 shadow-none bg-transparent w-full">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Access your Guardian Wallet using your passkey.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <PasskeyPrompt isProcessing={isProcessing} message="Ready to authenticate..." />
      </CardContent>
      <CardFooter className="px-0 pb-0 flex flex-col gap-2">
        <Button 
          className="w-full" 
          onClick={handleLogin}
          disabled={isProcessing}
        >
          {isProcessing ? "Signing in..." : "Sign in with Passkey"}
        </Button>
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={() => router.push("/create")}
          disabled={isProcessing}
        >
          Create a new wallet instead
        </Button>
      </CardFooter>
    </Card>
  );
}
