"use client";

import { useState } from "react";
import { useProposeRecovery, useRecoveryProposal } from "@/hooks/useRecovery";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ShieldAlert, Copy, CheckCircle, Clock, Loader2, ArrowRight } from "lucide-react";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";
import { startRegistration } from "@simplewebauthn/browser";

export default function RecoverWalletPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [walletAddress, setWalletAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [proposalId, setProposalId] = useState("");
  const [newCredentialId, setNewCredentialId] = useState("");

  const proposeRecovery = useProposeRecovery();
  const { data: proposalStatus, isLoading: statusLoading } = useRecoveryProposal(
    step === 3 ? proposalId : undefined
  );

  const handleStartRecovery = async () => {
    const addr = walletAddress.trim();
    if (!addr || addr.length !== 56) {
      toast.error("Enter a valid 56-character Stellar wallet address");
      return;
    }

    setIsProcessing(true);
    setStep(2);

    try {
      const userHandle = crypto.randomUUID();

      // Step 1: Get registration options for a new passkey on this device
      const optsRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle, userName: `Recovery Key for ${addr.slice(0, 8)}…` }),
      });
      if (!optsRes.ok) throw new Error("Failed to get registration options");
      const regOptions = await optsRes.json();

      // Step 2: Browser creates a new passkey — real WebAuthn interaction
      const credential = await startRegistration(regOptions);

      // Step 3: Verify and store the new credential on backend
      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle, response: credential }),
      });
      if (!verifyRes.ok) throw new Error("Failed to verify new passkey");

      setNewCredentialId(credential.id);

      // Step 4: Propose recovery on the backend — links new credentialId to walletAddress
      const res = await proposeRecovery.mutateAsync({
        walletAddress: addr,
        newSigner: credential.id, // Backend resolves credential to public key
      });

      setProposalId(res.proposalId ?? res.id ?? "");
      setStep(3);
      toast.success("Recovery proposal submitted — share the link with your guardians");
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate recovery");
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const shareableLink =
    typeof window !== "undefined" && proposalId
      ? `${window.location.origin}/recover/${proposalId}/approve`
      : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copied to clipboard");
  };

  const isComplete = proposalStatus?.status === "executed";
  const isApproved = proposalStatus?.status === "approved";

  return (
    <Card className="w-full gap-6 border-0 bg-transparent py-0 ring-0 shadow-none!">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/25">
            <ShieldAlert className="size-5" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl">Recover Wallet</CardTitle>
            <CardDescription>Regain access using your recovery guardians</CardDescription>
          </div>
        </div>

        {/* Progress steps */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                step > s ? "border-primary bg-primary text-primary-foreground" :
                step === s ? "border-primary text-primary" :
                "border-muted-foreground/30 text-muted-foreground"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 rounded ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
          <div className="ml-2 text-xs text-muted-foreground">
            {step === 1 && "Enter wallet address"}
            {step === 2 && "Create new passkey"}
            {step === 3 && "Await guardian approvals"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                This will create a <strong>new passkey</strong> on this device and propose it as your new wallet credential. Your guardians must approve before it takes effect.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Lost Wallet Address</Label>
              <Input
                placeholder="G... (56 characters)"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <PasskeyPrompt
            isProcessing={isProcessing}
            message="Your device will ask you to create a new passkey. Follow the prompts…"
          />
        )}

        {step === 3 && (
          <div className="space-y-5">
            {isComplete ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-success/12 text-success ring-1 ring-success/30">
                  <CheckCircle className="size-8" />
                </div>
                <p className="text-xl font-bold">Recovery Complete</p>
                <p className="text-sm text-muted-foreground">
                  Your new passkey is now the authorized signer for this wallet.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-sm font-medium">Share this link with your guardians</p>
                  <div className="flex gap-2">
                    <Input readOnly value={shareableLink} className="font-mono text-xs" />
                    <Button variant="secondary" size="icon" onClick={copyLink} title="Copy link">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Proposal Status</span>
                    {statusLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Badge
                        variant={isApproved ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {proposalStatus?.status ?? "pending"}
                      </Badge>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Approvals</span>
                    <span className="font-mono">{proposalStatus?.approvals?.length ?? 0} collected</span>
                  </div>
                  {proposalStatus?.timelockExpiresAt && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Timelock expires:{" "}
                        {new Date(proposalStatus.timelockExpiresAt).toLocaleString()}
                      </div>
                    </>
                  )}
                </div>

                {isApproved && (
                  <Alert className="border-primary/20 bg-primary/5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary/80">
                      All approvals collected and timelock expired. You can now execute the recovery.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-0 bg-transparent px-0 pb-0 pt-4 flex flex-col gap-2">
        {step === 1 && (
          <Button size="lg" className="w-full" onClick={handleStartRecovery} disabled={!walletAddress.trim()}>
            Start Recovery <ArrowRight data-icon="inline-end" />
          </Button>
        )}
        {step === 3 && !isComplete && isApproved && (
          <Button size="lg" className="w-full">
            Execute Recovery
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
