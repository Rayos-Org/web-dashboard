"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from "@simplewebauthn/browser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AuroraBackground } from "@/components/motion/AuroraBackground";
import { ShieldAlert, ArrowLeft, Fingerprint, Lock, Users } from "lucide-react";

const reassurances = [
  { icon: Fingerprint, text: "Secured by your device's biometrics" },
  { icon: Lock, text: "Non-custodial — keys never leave your device" },
  { icon: Users, text: "Guardian recovery if you lose access" },
];

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background">
      <AuroraBackground />

      <header className="relative z-10 mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative">
            <span className="absolute inset-0 rounded-xl bg-primary/40 blur-md" />
            <Image src="/logo.png" alt="Guardian Wallet" width={34} height={34} className="relative rounded-xl" />
          </span>
          <span className="text-lg font-bold tracking-tight">Guardian</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" className="hidden sm:inline-flex">
              <ArrowLeft data-icon="inline-start" /> Back to home
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </main>

      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 pb-8 text-xs text-muted-foreground">
        {reassurances.map((r) => (
          <span key={r.text} className="flex items-center gap-1.5">
            <r.icon className="size-3.5 text-primary" /> {r.text}
          </span>
        ))}
      </footer>
    </div>
  );
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSupport() {
      if (!browserSupportsWebAuthn()) {
        setIsSupported(false);
        return;
      }
      const hasPlatformAuth = await platformAuthenticatorIsAvailable();
      setIsSupported(hasPlatformAuth);
    }
    checkSupport();
  }, []);

  if (isSupported === null) {
    return (
      <Frame>
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <span className="relative flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Fingerprint className="size-6 animate-pulse" />
            <span className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </span>
          <p className="text-sm">Checking passkey support…</p>
        </div>
      </Frame>
    );
  }

  if (isSupported === false) {
    return (
      <Frame>
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert />
          <AlertTitle>Unsupported browser or device</AlertTitle>
          <AlertDescription>
            Guardian Wallet requires a browser and device that support WebAuthn platform
            authenticators (passkeys) such as Touch ID, Face ID or Windows Hello. Please try again
            on a supported device.
          </AlertDescription>
        </Alert>
      </Frame>
    );
  }

  return (
    <Frame>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div
          aria-hidden
          className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/25 via-violet-500/15 to-cyan-400/20 blur-3xl"
        />
        <div className="glass shadow-elevated relative rounded-3xl p-7 sm:p-9">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/25" />
          {children}
        </div>
      </motion.div>
    </Frame>
  );
}
