"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { walletSdk } from "@/lib/sdk-client";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, CheckCircle, ExternalLink, ArrowRight, Fingerprint, Loader2 } from "lucide-react";

type Phase = "idle" | "passkey" | "deploying";

/**
 * Wallet creation — every step is real:
 *   1. relay issues a WebAuthn challenge
 *   2. the browser creates a passkey (Windows Hello / Touch ID / Face ID)
 *   3. relay verifies the attestation and stores the public key (for sign-in)
 *   4. relay deploys a GuardianWallet contract on Stellar testnet for that passkey
 */
export default function CreateWalletPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [walletAddress, setWalletAddress] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [deployTx, setDeployTx] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const isProcessing = phase !== "idle";

  const handleCreatePasskey = async () => {
    if (!name.trim()) return;
    setPhase("passkey");
    try {
      const userHandle = crypto.randomUUID();

      // 1. Challenge from the relay (proxied through /api)
      const optsRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userHandle,
          userName: name.trim(),
          rpId: window.location.hostname,
        }),
      });
      if (!optsRes.ok) throw new Error("Relay is unreachable — could not fetch registration options");
      const options = await optsRes.json();

      // 2. Platform passkey (secure enclave / TPM). Extracts the P-256 public key.
      const credential = await walletSdk.registerPasskey(options);

      // 3. Relay verifies the attestation and stores the key for future sign-ins.
      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle, response: credential }),
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        throw new Error(err.message || "The relay could not verify your passkey");
      }

      // 4. Deploy the smart wallet on-chain (sponsored by the relay).
      setPhase("deploying");
      const salt = crypto.getRandomValues(new Uint8Array(32));
      const { address, txHash } = await walletSdk.deployWallet(credential, salt);

      setWalletAddress(address);
      setCredentialId(credential.id);
      setDeployTx(txHash);
      setStep(3);
      toast.success("Wallet deployed on Stellar testnet");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create wallet");
    } finally {
      setPhase("idle");
    }
  };

  const handleFinish = async () => {
    setSigningIn(true);
    await loginAction(walletAddress, credentialId);
    router.push("/wallet");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied to clipboard");
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <Card className="w-full gap-6 border-0 bg-transparent py-0 ring-0 shadow-none!">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl sm:text-3xl">Create your Guardian Wallet</CardTitle>
            <CardDescription>
              We use passkeys to secure your wallet. No seed phrases, no passwords.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4 pt-2">
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
          <CardFooter className="border-0 bg-transparent px-0 pb-0">
            <Button size="lg" className="w-full" onClick={() => setStep(2)} disabled={!name.trim()}>
              Continue <ArrowRight data-icon="inline-end" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="w-full gap-6 border-0 bg-transparent py-0 ring-0 shadow-none!">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl sm:text-3xl">Create Passkey</CardTitle>
            <CardDescription>
              Your device will ask you to authenticate with Windows Hello, Touch ID or Face ID.
              Then your smart wallet contract is deployed on Stellar testnet.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <PasskeyPrompt
              isProcessing={isProcessing}
              message={
                phase === "deploying"
                  ? "Passkey created — deploying your smart wallet on Stellar testnet (~10s)…"
                  : phase === "passkey"
                    ? "Follow your device's passkey prompt…"
                    : "Ready to create your passkey"
              }
            />
          </CardContent>
          <CardFooter className="border-0 bg-transparent px-0 pb-0 flex flex-col gap-2">
            <Button size="lg" className="w-full" onClick={handleCreatePasskey} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  {phase === "deploying" ? "Deploying wallet…" : "Creating…"}
                </>
              ) : (
                <>
                  <Fingerprint data-icon="inline-start" /> Create Passkey & Deploy Wallet
                </>
              )}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep(1)} disabled={isProcessing}>
              Back
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="w-full gap-6 border-0 bg-transparent py-0 ring-0 shadow-none!">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex size-11 items-center justify-center rounded-full bg-success/12 text-success ring-1 ring-success/30">
                <CheckCircle className="size-5" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl">Wallet Deployed!</CardTitle>
            </div>
            <CardDescription>
              Your passkey-secured smart wallet contract is live on Stellar testnet.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Your Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm break-all flex-1">{walletAddress}</code>
                <Button variant="ghost" size="icon" onClick={copyAddress} className="shrink-0" title="Copy address">
                  <Copy className="w-4 h-4" />
                </Button>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="View contract on explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Deployment transaction</p>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${deployTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary underline underline-offset-4"
                >
                  {deployTx.slice(0, 12)}…{deployTx.slice(-8)}
                </a>
              </div>
              <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
                On-chain
              </Badge>
            </div>
            <Alert>
              <AlertDescription className="text-sm">
                Next: on the dashboard, tap <strong>Get testnet XLM</strong> to fund your wallet, then send your first
                passkey-signed transaction.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="border-0 bg-transparent px-0 pb-0">
            <Button size="lg" className="w-full" onClick={handleFinish} disabled={signingIn}>
              {signingIn ? "Signing in…" : <>Go to Dashboard <ArrowRight data-icon="inline-end" /></>}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
