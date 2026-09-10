import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, Shield, Users, Zap, ArrowRight, Lock } from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Passkey-Secured",
    description: "No seed phrases, no passwords. Your biometrics are your keys.",
  },
  {
    icon: Shield,
    title: "On-Chain Policies",
    description: "Set spend limits and allow-lists enforced directly by the smart contract.",
  },
  {
    icon: Users,
    title: "Social Recovery",
    description: "Recover access with trusted guardians — no single point of failure.",
  },
  {
    icon: Zap,
    title: "Gasless Relay",
    description: "Transactions are relayed for you. No XLM needed to get started.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Guardian" width={28} height={28} />
            <span className="font-bold text-primary">Guardian</span>
            <Badge variant="secondary" className="text-xs ml-1">Testnet</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/create">
              <Button size="sm">Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="relative flex flex-col items-center justify-center text-center pt-36 pb-24 px-4 overflow-hidden">
          {/* Decorative gradient */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#D9770620,transparent)]"
          />
          <Badge className="mb-5 gap-1.5 text-sm" variant="outline">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse inline-block" />
            Live on Stellar Testnet
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance mb-6 max-w-3xl">
            Your wallet,{" "}
            <span className="text-primary">secured by your face</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 text-balance">
            Guardian Wallet is a passkey-powered Stellar smart wallet with on-chain spend policies and social recovery — built without seed phrases.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/create">
              <Button size="lg" className="gap-2 px-8">
                <Fingerprint className="h-5 w-5" />
                Create Wallet — Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                <Lock className="h-5 w-5" />
                Sign In
              </Button>
            </Link>
          </div>
          <Link
            href="/recover"
            className="mt-8 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Lost your device? Recover your wallet →
          </Link>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 pb-24 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 p-6 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Guardian Wallet · Rayos Org · Stellar Testnet
      </footer>
    </div>
  );
}
