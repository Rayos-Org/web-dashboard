"use client";

import { useTransactions, HorizonOperation } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function operationIcon(type: string, walletAddress: string, from?: string) {
  const isSend = from === walletAddress;
  switch (type) {
    case "payment":
      return isSend ? (
        <ArrowUpRight className="h-4 w-4 text-destructive" />
      ) : (
        <ArrowDownLeft className="h-4 w-4 text-primary" />
      );
    case "create_account":
      return <ArrowDownLeft className="h-4 w-4 text-primary" />;
    default:
      return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
  }
}

function operationLabel(op: HorizonOperation, walletAddress: string): string {
  switch (op.type) {
    case "payment":
      return op.from === walletAddress ? `Sent to ${op.to?.slice(0, 8)}…` : `Received from ${op.from?.slice(0, 8)}…`;
    case "create_account":
      return "Account Created";
    case "change_trust":
      return "Trust Line Changed";
    case "set_options":
      return "Options Updated";
    default:
      return op.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function operationAmount(op: HorizonOperation): string | null {
  const amount = op.amount || op.starting_balance;
  if (!amount) return null;
  const code = op.asset_code || (op.asset_type === "native" ? "XLM" : op.asset_type ?? "");
  return `${parseFloat(amount).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${code}`;
}

export function TransactionList({ walletAddress }: { walletAddress: string }) {
  const { data: txs, isLoading, isError, refetch } = useTransactions(walletAddress);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <button
          onClick={() => refetch()}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="space-y-0 divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="py-10 text-center text-sm text-destructive">
            Failed to load activity. Check your connection.
          </div>
        )}

        {!isLoading && !isError && txs && txs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Clock className="h-10 w-10 mb-3 opacity-20" />
            <p className="font-medium">No activity yet</p>
            <p className="text-sm mt-1">Transactions will appear here once your wallet is funded.</p>
          </div>
        )}

        {!isLoading && txs && txs.length > 0 && (
          <div className="divide-y">
            {txs.map((op, i) => {
              const isSend = op.from === walletAddress;
              const amount = operationAmount(op);
              return (
                <div key={op.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${
                    op.type === "payment" && isSend
                      ? "bg-destructive/10"
                      : "bg-primary/10"
                  }`}>
                    {operationIcon(op.type, walletAddress, op.from)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{operationLabel(op, walletAddress)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(op.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {amount && (
                      <span className={`text-sm font-semibold ${
                        op.type === "payment" && isSend ? "text-destructive" : "text-primary"
                      }`}>
                        {op.type === "payment" && isSend ? "−" : "+"}{amount}
                      </span>
                    )}
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${op.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5"
                    >
                      View ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
