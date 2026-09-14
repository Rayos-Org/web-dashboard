"use client";

import { useTransactions } from "@/hooks/useTransactions";
import { formatXLM } from "@/hooks/useWallet";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

/** Native-token transfers touching the wallet, straight from Soroban RPC events. */
export function TransactionList({ walletAddress }: { walletAddress: string }) {
  const { data: txs, isLoading, isError, refetch, isRefetching } = useTransactions(walletAddress);

  return (
    <Card>
      <CardHeader className="border-b pb-5">
        <CardTitle>Recent Activity</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh" disabled={isRefetching}>
            <RefreshCw data-icon="inline-start" className={isRefetching ? "animate-spin" : ""} /> Refresh
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
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
            Failed to load activity from Soroban RPC. Check your connection.
          </div>
        )}

        {!isLoading && !isError && txs && txs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <Clock className="size-6 opacity-50" />
            </div>
            <p className="font-medium">No activity yet</p>
            <p className="text-sm mt-1">Fund the wallet with testnet XLM and send your first transaction.</p>
          </div>
        )}

        {!isLoading && txs && txs.length > 0 && (
          <div className="divide-y">
            {txs.map((t) => {
              const isOut = t.direction === "out";
              return (
                <div key={t.txHash + t.ledger} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ${
                      isOut ? "bg-destructive/10 ring-destructive/20" : "bg-success/10 ring-success/20"
                    }`}
                  >
                    {isOut ? (
                      <ArrowUpRight className="h-4 w-4 text-destructive" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {isOut ? `Sent to ${shortAddr(t.to)}` : `Received from ${shortAddr(t.from)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(t.at), { addSuffix: true })} · ledger {t.ledger}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-semibold ${isOut ? "text-destructive" : "text-success"}`}>
                      {isOut ? "−" : "+"}
                      {formatXLM(t.amount)} XLM
                    </span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${t.txHash}`}
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
