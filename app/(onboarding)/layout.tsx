"use client";

import { useEffect, useState } from "react";
import { browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from "@simplewebauthn/browser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

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
    return null; // or a minimal loading spinner
  }

  if (isSupported === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Unsupported Browser or Device</AlertTitle>
          <AlertDescription>
            Guardian Wallet requires a browser and device that support WebAuthn platform authenticators (Passkeys) like Touch ID, Face ID, or Windows Hello. Please try again on a supported device.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border">
        {children}
      </div>
    </div>
  );
}
