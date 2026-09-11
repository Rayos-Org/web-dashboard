"use client";

import { useState } from "react";
import { useSessionKeys, useCreateSessionKey, useRevokeSessionKey } from "@/hooks/usePolicies";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, Key } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PasskeyPrompt } from "@/components/wallet/PasskeyPrompt";
import { startAuthentication } from "@simplewebauthn/browser";

export function SessionKeyList({ walletAddress }: { walletAddress: string }) {
  const { data: sessions, isLoading } = useSessionKeys(walletAddress);
  const revokeSession = useRevokeSessionKey();
  const createSession = useCreateSessionKey();

  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState("");
  const [expiryHours, setExpiryHours] = useState("24");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);

  const handleRevoke = async (id: string) => {
    try {
      await revokeSession.mutateAsync({ id, walletAddress });
      toast.success("Session key revoked");
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke session key");
    }
  };

  const handleCreate = async () => {
    if (!scope.trim()) return;
    setIsProcessing(true);
    setShowPasskey(true);

    try {
      // Get assertion options to generate a real signature for the session payload
      const optsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHandle: walletAddress }),
      });
      if (!optsRes.ok) throw new Error("Failed to get assertion options");
      const options = await optsRes.json();

      // User authenticates with their passkey — produces a real signature
      const assertionResponse = await startAuthentication(options);

      const expiresAt = new Date(
        Date.now() + parseInt(expiryHours) * 60 * 60 * 1000
      ).toISOString();

      await createSession.mutateAsync({
        walletAddress,
        scope: scope.trim(),
        expiresAt,
        signature: assertionResponse.response.signature,
      });

      toast.success("Session key created");
      setOpen(false);
      setScope("");
      setExpiryHours("24");
    } catch (err: any) {
      toast.error(err.message || "Failed to create session key");
    } finally {
      setIsProcessing(false);
      setShowPasskey(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle>Session Keys</CardTitle>
        <CardDescription>Time-limited sub-keys for dApp interactions.</CardDescription>
        <CardAction>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button><Plus data-icon="inline-start" /> New Session</Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Session Key</DialogTitle>
              <DialogDescription>Authorize a new ephemeral key scoped to specific contracts.</DialogDescription>
            </DialogHeader>
            {showPasskey ? (
              <div className="py-6">
                <PasskeyPrompt isProcessing={isProcessing} message="Sign session key authorization…" />
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Scope (Contract Addresses)</Label>
                  <Input
                    placeholder="C... (comma-separated)"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Contracts this key is permitted to call. Leave blank for wildcard.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Expiry (Hours)</Label>
                  <Input
                    type="number"
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(e.target.value)}
                    min="1"
                    max="720"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              {!showPasskey && (
                <Button onClick={handleCreate} disabled={!scope.trim() || isProcessing}>
                  Authorize Key
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!isLoading && sessions && sessions.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scope</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => {
                  const isExpired = new Date(session.expiresAt) < new Date();
                  return (
                    <TableRow key={session.sessionId}>
                      <TableCell className="font-mono text-xs max-w-[180px] truncate" title={session.scope}>
                        {session.scope}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {isExpired
                          ? "Expired"
                          : formatDistanceToNow(new Date(session.expiresAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isExpired ? "secondary" : "default"}>
                          {isExpired ? "Inactive" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRevoke(session.sessionId)}
                          disabled={isExpired || revokeSession.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : !isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 text-center text-muted-foreground">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted"><Key className="size-6 opacity-50" /></div>
            <p className="font-medium">No active session keys</p>
            <p className="text-sm mt-1">Create one to authorize dApp connections.</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
