"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Fingerprint,
  Shield,
  Users,
  Zap,
  ArrowRight,
  Lock,
  ChevronDown,
  GitBranch,
  ExternalLink,
  BookOpen,
  Code2,
  CheckCircle2,
  Star,
  Send,
  KeyRound,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: Fingerprint,
    title: "Passkey Authentication",
    description:
      "Your biometrics replace seed phrases entirely. Create and sign transactions with Face ID or Touch ID — no passwords, no recovery phrases to lose.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "On-Chain Spend Policies",
    description:
      "Set per-session spending limits and address allow-lists enforced directly inside the Soroban smart contract. Not in a backend — on-chain.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Social Recovery",
    description:
      "Designate trusted guardians who can collectively approve a new key if you lose your device — with threshold voting, not a single point of trust.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Gasless Relay",
    description:
      "Transactions are relayed on your behalf. You never need to pre-fund the wallet with XLM just to get started.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: KeyRound,
    title: "Session Keys",
    description:
      "Delegate scoped signing permissions to dApps with expiry and spend-limit constraints. Revoke at any time from the dashboard.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: Send,
    title: "Instant Transfers",
    description:
      "Send XLM to any Stellar address in seconds. The interface handles XDR construction and relay submission end-to-end.",
    gradient: "from-cyan-400 to-indigo-500",
  },
];

const steps = [
  {
    step: "01",
    title: "Register with your biometrics",
    description:
      "Tap 'Create Wallet' and your browser's WebAuthn API creates a passkey secured by your device's secure enclave or biometric sensor. Nothing is sent to our servers.",
  },
  {
    step: "02",
    title: "Smart contract deploys on Stellar",
    description:
      "A Soroban smart-wallet contract is instantiated on Stellar Testnet using your passkey's public key as the sole authorized signer.",
  },
  {
    step: "03",
    title: "Receive and send assets",
    description:
      "Fund your wallet via Friendbot or receive XLM from anyone. Sign outgoing transactions with your biometrics — one tap, one assertion, done.",
  },
  {
    step: "04",
    title: "Configure policies and guardians",
    description:
      "Set spend limits, add trusted guardian addresses, and create session keys for dApps — all enforceable on-chain without trusting a central server.",
  },
];

const faqs = [
  {
    q: "Do I need XLM to create a wallet?",
    a: "No. The gasless relay funds the initial contract deployment and your early transactions. You can fund your wallet later via Stellar's Friendbot on testnet.",
  },
  {
    q: "What happens if I lose my device?",
    a: "If you set up guardians before losing access, they can collectively approve a recovery proposal that replaces your signing key. We recommend setting up at least 2 guardians.",
  },
  {
    q: "Is this on mainnet?",
    a: "Currently on Stellar Testnet only. Mainnet launch is planned after a full security audit of the Soroban contracts.",
  },
  {
    q: "Who controls my private keys?",
    a: "Nobody — not even us. The passkey's private key material never leaves your device's secure enclave. Guardian Wallet is fully non-custodial.",
  },
  {
    q: "How does the relay work without a trusted backend?",
    a: "The relay only submits pre-signed XDR transactions. It cannot forge signatures or move funds. Even if the relay is compromised, your funds are safe.",
  },
  {
    q: "Can I use this on multiple devices?",
    a: "Yes. You can add additional passkeys (from other devices) as co-signers to your smart wallet contract from the Signers tab in the dashboard.",
  },
];

const docs = [
  {
    icon: BookOpen,
    title: "Setup Guide",
    description: "Clone, configure env vars, and run the project locally in under 5 minutes.",
    href: "https://github.com/Rayos-Org/web-dashboard/blob/main/docs/SETUP.md",
    label: "Read Setup Guide",
  },
  {
    icon: Code2,
    title: "Architecture",
    description: "Understand the full system — contracts, relay, SDK, and frontend data flow.",
    href: "https://github.com/Rayos-Org/web-dashboard/blob/main/docs/ARCHITECTURE.md",
    label: "View Architecture",
  },
  {
    icon: Users,
    title: "Contributing",
    description: "Branch conventions, coding standards, and the no-mock-data rule.",
    href: "https://github.com/Rayos-Org/web-dashboard/blob/main/docs/CONTRIBUTING.md",
    label: "Contribute",
  },
];

/* ─────────────────────────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left font-medium hover:bg-muted/40 transition-colors"
      >
        <span>{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Guardian Wallet" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-lg tracking-tight">Guardian</span>
            <Badge variant="outline" className="text-xs border-primary/40 text-primary hidden sm:inline-flex">
              Testnet
            </Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#docs" className="hover:text-foreground transition-colors">Docs</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="https://github.com/Rayos-Org/web-dashboard" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <GitBranch className="h-4 w-4" />
              </Button>
            </a>
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/create">
              <Button size="sm" className="gap-1.5">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">

        {/* ── HERO ────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center text-center pt-40 pb-28 px-4 overflow-hidden">
          {/* Background glows */}
          <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute top-20 left-1/3 w-[400px] h-[400px] rounded-full bg-violet-500/8 blur-3xl" />
            <div className="absolute top-10 right-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/8 blur-3xl" />
          </div>

          <Badge className="mb-6 gap-1.5 text-sm px-4 py-1.5 border-primary/30 bg-primary/5 text-primary" variant="outline">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />
            Live on Stellar Testnet
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-balance mb-6 max-w-4xl leading-[1.05]">
            Your wallet,{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
              secured by biometrics
            </span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 text-balance leading-relaxed">
            Guardian Wallet is a passkey-powered Stellar smart wallet. No seed phrases, no passwords —
            just your face or fingerprint. With on-chain spend policies and social recovery built in.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Link href="/create">
              <Button size="lg" className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/25">
                <Fingerprint className="h-5 w-5" />
                Create Wallet — Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base">
                <Lock className="h-5 w-5" />
                Sign In
              </Button>
            </Link>
          </div>

          <Link
            href="/recover"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Lost your device? Recover your wallet →
          </Link>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-xs text-muted-foreground">
            {[
              "Non-custodial",
              "Open source",
              "No seed phrases",
              "Soroban smart contracts",
              "WebAuthn / Passkeys",
            ].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 px-4 bg-muted/30 border-y border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
                How it works
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Up and running in minutes
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                No extension to install, no seed phrase to write down. Just a browser and your biometrics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((s, i) => (
                <div
                  key={s.step}
                  className="relative p-8 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{s.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                  {/* Connector line (desktop) */}
                  {i % 2 === 0 && i < steps.length - 1 && (
                    <div aria-hidden className="hidden md:block absolute right-0 top-1/2 translate-x-full -translate-y-1/2 w-6 border-t-2 border-dashed border-border/60 z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section id="features" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
                Features
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Built on open standards — WebAuthn, Soroban, Stellar — with no proprietary lock-in.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ───────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-600 p-12 text-center text-white shadow-2xl">
              {/* Decorative blobs */}
              <div aria-hidden className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
              <div aria-hidden className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <Image src="/logo.png" alt="Guardian Wallet" width={56} height={56} className="rounded-xl shadow-lg" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-balance">
                  Ready to ditch your seed phrase?
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto text-balance">
                  Join the testnet early. Your feedback shapes what Guardian Wallet becomes on mainnet.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/create">
                    <Button size="lg" className="bg-white text-indigo-700 hover:bg-white/90 gap-2 px-8 h-12 font-semibold shadow-lg">
                      <Fingerprint className="h-5 w-5" />
                      Create Your Wallet
                    </Button>
                  </Link>
                  <a href="https://github.com/Rayos-Org/web-dashboard" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 px-8 h-12">
                      <GitBranch className="h-5 w-5" />
                      View on GitHub
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DOCS ─────────────────────────────────────────────── */}
        <section id="docs" className="py-24 px-4 bg-muted/30 border-y border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
                Documentation
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Open source & contributor-friendly
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Every piece of this project is documented and open. Jump in.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {docs.map((d) => (
                <a
                  key={d.title}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <d.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{d.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{d.description}</p>
                  <div className="flex items-center gap-1.5 mt-5 text-sm text-primary font-medium">
                    {d.label} <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>
              ))}
            </div>

            {/* GitHub stars CTA */}
            <div className="flex justify-center mt-10">
              <a
                href="https://github.com/Rayos-Org/web-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-full px-5 py-2.5 hover:border-primary/40 bg-card"
              >
                <Star className="h-4 w-4 text-yellow-500" />
                Star us on GitHub — it helps the project grow!
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Common questions
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to know before you start.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="Guardian Wallet" width={28} height={28} className="rounded-lg" />
                <span className="font-bold">Guardian Wallet</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A passkey-secured, policy-governed smart wallet on the Stellar network. Built by Rayos Org.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a href="https://github.com/Rayos-Org/web-dashboard" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <GitBranch className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* App */}
            <div>
              <p className="font-semibold text-sm mb-4">App</p>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/create" className="hover:text-foreground transition-colors">Create Wallet</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href="/recover" className="hover:text-foreground transition-colors">Recover Wallet</Link></li>
              </ul>
            </div>

            {/* Docs */}
            <div>
              <p className="font-semibold text-sm mb-4">Documentation</p>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li>
                  <a href="https://github.com/Rayos-Org/web-dashboard/blob/main/docs/SETUP.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Setup Guide</a>
                </li>
                <li>
                  <a href="https://github.com/Rayos-Org/web-dashboard/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Architecture</a>
                </li>
                <li>
                  <a href="https://github.com/Rayos-Org/web-dashboard/blob/main/docs/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Contributing</a>
                </li>
                <li>
                  <a href="https://github.com/Rayos-Org/web-dashboard/blob/main/docs/SECURITY.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Security</a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="font-semibold text-sm mb-4">Legal & Community</p>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li>
                  <a href="https://github.com/Rayos-Org/web-dashboard/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">MIT License</a>
                </li>
                <li>
                  <a href="https://github.com/Rayos-Org/web-dashboard/blob/main/docs/CODE_OF_CONDUCT.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Code of Conduct</a>
                </li>
                <li>
                  <a href="https://github.com/Rayos-Org/web-dashboard/issues" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Report a Bug</a>
                </li>
                <li>
                  <a href="https://github.com/Rayos-Org/web-dashboard/discussions" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Discussions</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Rayos Org. MIT License. Running on Stellar Testnet.</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Testnet live</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
