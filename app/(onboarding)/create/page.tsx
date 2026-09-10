"use client";

import { useState } from "react";
import { walletSdk } from "@/lib/sdk-client";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Copy, CheckCircle, ExternalLink } from "lucide-react";

export default function CreateWalletPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [credentialId, setCredentialId] = useState("");

  const handleCreatePasskey = async () => {
    if (!name.trim()) return;
    setIsProcessing(true);
    
    try {
      const userHandle = crypto.randomUUID();
      
      // 1. Get options from our proxy
      const optsRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle, userName: name }),
      });
      
      if (!optsRes.ok) throw new Error("Failed to fetch registration options");
      const options = await optsRes.json();
      
      // 2. Delegate passkey creation and deployment to SDK
      // Using a random 32-byte salt for the deterministic address
      const saltBytes = crypto.getRandomValues(new Uint8Array(32));
      
      const { address, credential } = await walletSdk.createWallet(options, saltBytes);
      
      setWalletAddress(address);
      setCredentialId(credential.id);
      setStep(3);
      toast.success("Wallet created successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create passkey");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = async () => {
    // Calls server action to set cookie, then redirects to dashboard
    setIsProcessing(true);
    await loginAction(walletAddress, credentialId);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied to clipboard");
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl">Create your Guardian Wallet</CardTitle>
            <CardDescription>
              We use passkeys to secure your wallet. No seed phrases, no passwords.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Wallet Name (e.g. Personal)</Label>
              <Input 
                id="name" 
                placeholder="My Wallet" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="px-0 pb-0">
            <Button 
              className="w-full" 
              onClick={() => setStep(2)}
              disabled={!name.trim()}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl">Create Passkey</CardTitle>
            <CardDescription>
              Your device will ask you to authenticate (Face ID, Touch ID, etc).
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <PasskeyPrompt isProcessing={isProcessing} />
          </CardContent>
          <CardFooter className="px-0 pb-0 flex flex-col gap-2">
            <Button 
              className="w-full" 
              onClick={handleCreatePasskey}
              disabled={isProcessing}
            >
              {isProcessing ? "Creating..." : "Create Passkey"}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => setStep(1)}
              disabled={isProcessing}
            >
              Back
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Wallet Deployed!</CardTitle>
            </div>
            <CardDescription>
              Your passkey-secured smart wallet is live on Stellar testnet.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Your Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm break-all flex-1">{walletAddress}</code>
                <Button variant="ghost" size="icon" onClick={copyAddress} className="shrink-0" title="Copy address">
                  <Copy className="w-4 h-4" />
                </Button>
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="View on explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <AlertDescription className="text-xs">
                Fund your wallet using{" "}
                <a
                  href={`https://friendbot.stellar.org?addr=${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium text-amber-700 dark:text-amber-400"
                >
                  Stellar Friendbot
                </a>{" "}
                to receive testnet XLM.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="px-0 pb-0">
            <Button
              className="w-full"
              onClick={handleFinish}
              disabled={isProcessing}
            >
              {isProcessing ? "Signing in..." : "Go to Dashboard →"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
