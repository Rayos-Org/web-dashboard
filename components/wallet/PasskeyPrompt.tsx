import { Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasskeyPromptProps {
  isProcessing: boolean;
  message?: string;
  className?: string;
}

export function PasskeyPrompt({ isProcessing, message = "Follow your browser's instructions...", className }: PasskeyPromptProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4 border rounded-xl bg-muted/30", className)}>
      <div className={cn("relative p-6 rounded-full bg-primary/10 text-primary", isProcessing && "animate-pulse")}>
        <Fingerprint className="w-12 h-12" />
        {isProcessing && (
          <span className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        )}
      </div>
      <p className="text-sm text-center text-muted-foreground font-medium">
        {message}
      </p>
    </div>
  );
}
