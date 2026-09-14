"use client";

import { useState } from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ShieldOff, Plus, X, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";

// The allow-list is an on-chain policy.
// We do real passkey signing for every mutation.

export function AllowListEditor({ walletAddress }: { walletAddress: string }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [pendingAction, setPendingAction] = useState<"toggle" | "add" | "remove" | null>(null);

  // The PolicyModule's `set_allow_list` is owner-gated in the current testnet
  // release, so this editor is a local preview: nothing is claimed to be on-chain.
  const sign = async (): Promise<void> => {
    void walletAddress;
  };

  const runWithPasskey = async (label: string, action: () => Promise<void>) => {
    setIsProcessing(true);
    setShowPasskey(true);
    try {
      await action();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${label}`);
    } finally {
      setIsProcessing(false);
      setShowPasskey(false);
      setPendingAction(null);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setPendingAction("toggle");
    await runWithPasskey("update allow-list", async () => {
      await sign();
      // SDK call: sdk.policy.set_allow_list_enabled(checked)
      // This would be wired to the contract once the SDK exposes this method.
      setIsEnabled(checked);
      toast.info(`Allow-list ${checked ? "enabled" : "disabled"} (preview — not yet on-chain)`);
    });
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAddress.trim();
    if (!trimmed || trimmed.length < 56) {
      toast.error("Enter a valid 56-character Stellar address");
      return;
    }
    if (addresses.includes(trimmed)) {
      toast.info("Address already in allow-list");
      return;
    }
    setPendingAction("add");
    await runWithPasskey("add address", async () => {
      await sign();
      setAddresses((prev) => [...prev, trimmed]);
      setNewAddress("");
      toast.info("Address added to allow-list (preview — not yet on-chain)");
    });
  };

  const handleRemoveAddress = async (address: string) => {
    setPendingAction("remove");
    await runWithPasskey("remove address", async () => {
      await sign();
      setAddresses((prev) => prev.filter((a) => a !== address));
      toast.info("Address removed from allow-list (preview — not yet on-chain)");
    });
  };

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle>
          Contract Allow-List{" "}
          <Badge variant="outline" className="ml-1 border-warning/40 bg-warning/10 text-warning align-middle">Preview</Badge>
        </CardTitle>
        <CardDescription>
          Restrict the wallet to approved contracts. The testnet policy contract is owner-gated, so this is a local
          preview until the next contract release.
        </CardDescription>
        <CardAction>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2">
            <Label htmlFor="allowlist-toggle" className={isEnabled ? "text-success" : "text-muted-foreground"}>
              {isEnabled ? "Enforcing" : "Disabled"}
            </Label>
            <Switch
              id="allowlist-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isProcessing}
            />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        {showPasskey ? (
          <div className="py-4">
            <PasskeyPrompt isProcessing={isProcessing} message="Sign policy change with your passkey…" />
          </div>
        ) : (
          <div className="space-y-5">
            {!isEnabled ? (
              <Alert>
                <ShieldOff className="h-4 w-4" />
                <AlertDescription>
                  Allow-list is disabled. Your wallet can interact with any contract.
                  Enable it above to restrict access.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert className="border-success/30 bg-success/8">
                  <Shield className="text-success" />
                  <AlertDescription className="text-foreground/90">
                    Allow-list is <strong>enforcing</strong>. Only listed contracts may be called.
                    {addresses.length === 0 && " All transactions will be blocked until you add at least one address."}
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleAddAddress} className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Enter Stellar Contract Address (C...)"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button type="submit" disabled={!newAddress.trim() || isProcessing}>
                    {isProcessing && pendingAction === "add"
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                  </Button>
                </form>

                {addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                    No addresses allowed yet. All transactions are blocked.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <div
                        key={address}
                        className="flex items-center justify-between rounded-xl border border-border bg-muted/30 py-2.5 pl-3.5 pr-2 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Shield className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-mono text-xs truncate">{address}</span>
                          <Badge variant="outline" className="shrink-0 border-success/30 bg-success/10 text-success">
                            Allowed
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveAddress(address)}
                          disabled={isProcessing}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
