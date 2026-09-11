"use client";

import { motion } from "motion/react";
import { Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasskeyPromptProps {
  isProcessing: boolean;
  message?: string;
  className?: string;
}

export function PasskeyPrompt({
  isProcessing,
  message = "Follow your browser's instructions...",
  className,
}: PasskeyPromptProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center space-y-5 overflow-hidden rounded-2xl border border-border bg-muted/30 p-8",
        className
      )}
    >
      {isProcessing && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_35%,color-mix(in_oklch,var(--primary)_10%,transparent)_50%,transparent_65%)] bg-[length:200%_100%]"
        />
      )}
      <div className="relative flex size-24 items-center justify-center">
        {/* Pulse rings while waiting on the authenticator */}
        {isProcessing &&
          [0, 1].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-full border border-primary/50"
              initial={{ scale: 0.7, opacity: 0.7 }}
              animate={{ scale: 1.45, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.9, ease: "easeOut" }}
            />
          ))}
        <motion.div
          animate={isProcessing ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 1.4, repeat: isProcessing ? Infinity : 0, ease: "easeInOut" }}
          className="relative flex size-20 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/25"
        >
          <Fingerprint className="size-10" />
        </motion.div>
      </div>
      <p className="relative text-center text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
