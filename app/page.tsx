"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AuroraBackground } from "@/components/motion/AuroraBackground";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
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
  Menu,
  ArrowUpRight,
  ArrowDownLeft,
  Globe,
  Server,
  Cpu,
  ShieldCheck,
  Sparkles,
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
    span: "lg:col-span-2",
  },
  {
    icon: Shield,
    title: "On-Chain Spend Policies",
    description:
      "Per-window spending caps and allow-lists enforced inside the Soroban contract itself — not in a backend that can be bypassed.",
    gradient: "from-violet-500 to-purple-600",
    span: "",
  },
  {
    icon: Users,
    title: "Social Recovery",
    description:
      "Trusted guardians collectively approve a new key if you lose your device — threshold voting, not a single point of trust.",
    gradient: "from-cyan-500 to-blue-500",
    span: "",
  },
  {
    icon: Zap,
    title: "Gasless Relay",
    description:
      "Transactions are sponsored and relayed on your behalf. No pre-funding just to get started.",
    gradient: "from-blue-500 to-indigo-600",
    span: "",
  },
  {
    icon: KeyRound,
    title: "Session Keys",
    description:
      "Delegate scoped, expiring signing permissions to dApps. Revoke instantly from the dashboard.",
    gradient: "from-indigo-500 to-violet-600",
    span: "",
  },
  {
    icon: Send,
    title: "Instant Transfers",
    description:
      "Send XLM to any Stellar address in seconds. XDR construction and relay submission are handled end-to-end.",
    gradient: "from-cyan-400 to-indigo-500",
    span: "lg:col-span-2",
  },
];

const steps = [
  {
    step: "01",
    icon: Fingerprint,
    title: "Register with your biometrics",
    description:
      "Your browser's WebAuthn API creates a passkey inside your device's secure enclave. Nothing secret ever leaves the device.",
  },
  {
    step: "02",
    icon: Cpu,
    title: "Smart contract deploys on Stellar",
    description:
      "A Soroban smart-wallet contract is instantiated with your passkey's public key as the sole authorised signer.",
  },
  {
    step: "03",
    icon: Send,
    title: "Receive and send assets",
    description:
      "Fund via Friendbot or receive XLM from anyone. Sign outgoing transactions with one tap of your fingerprint.",
  },
  {
    step: "04",
    icon: ShieldCheck,
    title: "Configure policies and guardians",
    description:
      "Spend limits, guardian sets and session keys — all enforceable on-chain without trusting a central server.",
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

const trustTags = [
  "Non-custodial",
  "Open source · MIT",
  "No seed phrases",
  "Soroban smart contracts",
  "WebAuthn / Passkeys",
  "Gas sponsored",
  "M-of-N recovery",
];

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#architecture", label: "Architecture" },
  { href: "#docs", label: "Docs" },
  { href: "#faq", label: "FAQ" },
];

const GITHUB = "https://github.com/Rayos-Org/web-dashboard";

/* ─────────────────────────────────────────────────────────────────
   NAV
───────────────────────────────────────────────────────────────── */
function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <motion.div
        aria-hidden
        style={{ opacity: bg }}
        className="absolute inset-0 glass border-x-0 border-t-0"
      />
      <div className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative">
            <span className="absolute inset-0 rounded-xl bg-primary/40 blur-md" />
            <Image
              src="/logo.png"
              alt="Guardian Wallet"
              width={36}
              height={36}
              className="relative rounded-xl"
              priority
            />
          </span>
          <span className="text-lg font-bold tracking-tight">Guardian</span>
          <Badge
            variant="outline"
            className="hidden border-primary/40 bg-primary/10 text-primary sm:inline-flex"
          >
            Testnet
          </Badge>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
            aria-label="GitHub repository"
          >
            <Button variant="outline" size="icon">
              <GitBranch />
            </Button>
          </a>
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/create" className="hidden sm:block">
            <Button>
              Get Started <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm">
              <SheetHeader className="border-b">
                <SheetTitle className="flex items-center gap-2">
                  <Image src="/logo.png" alt="" width={24} height={24} className="rounded-md" />
                  Guardian Wallet
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-3">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t p-4">
                <Link href="/create">
                  <Button size="lg" className="w-full">
                    <Fingerprint data-icon="inline-start" /> Create Wallet
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="ghost" className="w-full">
                    <GitBranch data-icon="inline-start" /> GitHub
                  </Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}

/* ─────────────────────────────────────────────────────────────────
   HERO PRODUCT MOCKUP (decorative — illustrative values only)
───────────────────────────────────────────────────────────────── */
function WalletMockup() {
  const rows = [
    { icon: ArrowDownLeft, label: "Received from GCX4…", amount: "+250 XLM", up: true, when: "2m ago" },
    { icon: ArrowUpRight, label: "Sent to GA7Q…", amount: "−12.5 XLM", up: false, when: "1h ago" },
    { icon: KeyRound, label: "Session key authorised", amount: "24h", up: true, when: "3h ago" },
  ];

  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[460px] select-none">
      {/* Glow */}
      <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-cyan-400/25 blur-3xl" />

      <TiltCard max={7} className="group">
        <div className="glass shadow-elevated relative overflow-hidden rounded-3xl p-6 sm:p-7">
          {/* top shine */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/30" />

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-semibold">Guardian</span>
            </div>
            <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
              <span className="size-1.5 rounded-full bg-success" /> Active
            </Badge>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Balance · Testnet
          </p>
          <p className="mt-1.5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            1,240<span className="text-muted-foreground/60">.50</span>
            <span className="ml-2 text-lg font-medium text-muted-foreground">XLM</span>
          </p>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5">
            <code className="flex-1 truncate font-mono text-xs text-muted-foreground">
              GDQ7X2…K9F3A
            </code>
            <Fingerprint className="size-4 text-primary" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-[0_8px_20px_-8px_var(--primary)]">
              <ArrowUpRight className="size-4" /> Send
            </div>
            <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-medium">
              <ArrowDownLeft className="size-4" /> Receive
            </div>
          </div>

          <div className="mt-6 space-y-1">
            {rows.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.12, duration: 0.45 }}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors group-hover:bg-muted/30"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                    r.up ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive"
                  }`}
                >
                  <r.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.when}</p>
                </div>
                <span className={`text-sm font-semibold ${r.up ? "text-success" : "text-foreground"}`}>
                  {r.amount}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </TiltCard>

      {/* Floating chips */}
      <motion.div
        initial={{ opacity: 0, y: 16, x: -8 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="glass shadow-elevated absolute -left-8 -top-6 hidden items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium animate-float sm:flex"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-4" />
        </span>
        Passkey verified
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, x: 8 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        style={{ animationDelay: "-3s" }}
        className="glass shadow-elevated absolute -bottom-6 -right-8 hidden items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium animate-float sm:flex"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Shield className="size-4" />
        </span>
        <span>
          Limit <span className="text-muted-foreground">100 XLM / 24h</span>
        </span>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ARCHITECTURE FLOW
───────────────────────────────────────────────────────────────── */
function ArchitectureFlow() {
  const nodes = [
    {
      icon: Globe,
      title: "Your browser",
      sub: "Passkey · WebAuthn",
      detail: "Private key lives in the secure enclave. Signs, never exports.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Server,
      title: "Relay",
      sub: "Fee sponsorship",
      detail: "Submits pre-signed XDR. Cannot forge signatures or move funds.",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: Cpu,
      title: "Soroban contract",
      sub: "Stellar Testnet",
      detail: "Verifies the passkey signature, enforces policies, executes.",
      color: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <div className="relative">
      {/* Animated connector (desktop) */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[52px] hidden h-2 w-full md:block"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
      >
        <line x1="16" y1="1" x2="84" y2="1" stroke="currentColor" strokeWidth="0.4" className="text-border" />
        <motion.line
          x1="16"
          y1="1"
          x2="84"
          y2="1"
          stroke="url(#flow)"
          strokeWidth="0.6"
          strokeDasharray="6 94"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
        />
        <defs>
          <linearGradient id="flow" x1="0" x2="1">
            <stop offset="0" stopColor="#6366F1" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>

      <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {nodes.map((n, i) => (
          <StaggerItem key={n.title} className="group relative">
            <div className="glass shadow-elevated relative flex h-full flex-col items-center rounded-2xl p-7 text-center transition-all duration-300 hover:-translate-y-1">
              <div
                className={`relative mb-5 flex size-[72px] items-center justify-center rounded-2xl bg-gradient-to-br ${n.color} shadow-lg`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 to-transparent" />
                <n.icon className="relative size-8 text-white" />
              </div>
              <span className="absolute left-4 top-4 font-mono text-xs text-muted-foreground">
                0{i + 1}
              </span>
              <h3 className="text-lg font-semibold">{n.title}</h3>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-primary">
                {n.sub}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{n.detail}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────────────────────────── */
function FAQItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
        open ? "border-primary/40 bg-card ring-glow" : "border-border bg-card/60 hover:border-foreground/20"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium transition-colors"
      >
        <span>{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
            open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-6 pb-6 text-[15px] leading-relaxed text-muted-foreground">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION HEADING
───────────────────────────────────────────────────────────────── */
function SectionHeading({
  eyebrow,
  title,
  blurb,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  blurb?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={`mb-14 ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      <Badge variant="outline" className="mb-5 border-primary/40 bg-primary/10 text-primary">
        <Sparkles /> {eyebrow}
      </Badge>
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">{title}</h2>
      {blurb && <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance">{blurb}</p>}
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────── */
export default function Home() {
  const heroWords = ["Your wallet,", "secured by", "biometrics."];

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background">
      <Nav />

      <main className="flex flex-1 flex-col">
        {/* ── HERO ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:pt-40 lg:pb-28">
          <AuroraBackground />

          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <Reveal mode="mount" className="mb-7 flex justify-center lg:justify-start">
                <Badge
                  variant="outline"
                  className="h-8 gap-2 border-primary/40 bg-primary/10 px-4 text-[13px] text-primary"
                >
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                  Live on Stellar Testnet
                </Badge>
              </Reveal>

              <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                {heroWords.map((w, i) => (
                  <motion.span
                    key={w}
                    initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className={`block ${i === 2 ? "text-gradient pb-2" : ""}`}
                  >
                    {w}
                  </motion.span>
                ))}
              </h1>

              <Reveal mode="mount" delay={0.5}>
                <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-balance lg:mx-0 lg:text-xl">
                  Guardian Wallet is a passkey-powered Stellar smart wallet. No seed phrases, no
                  passwords — just your face or fingerprint, with on-chain spend policies and social
                  recovery built in.
                </p>
              </Reveal>

              <Reveal mode="mount" delay={0.62}>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link href="/create">
                    <Button size="lg" className="min-w-[210px]">
                      <Fingerprint data-icon="inline-start" />
                      Create Wallet — Free
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="min-w-[150px]">
                      <Lock data-icon="inline-start" />
                      Sign In
                    </Button>
                  </Link>
                </div>
                <Link
                  href="/recover"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Lost your device? Recover your wallet <ArrowRight className="size-3.5" />
                </Link>
              </Reveal>

              <Reveal mode="mount" delay={0.78}>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start">
                  {["Non-custodial", "Open source", "No seed phrases"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-primary" /> {t}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <WalletMockup />
            </motion.div>
          </div>
        </section>

        {/* ── MARQUEE ────────────────────────────────────────────── */}
        <section aria-label="Highlights" className="relative border-y border-border/60 bg-muted/30 py-5">
          <div
            className="overflow-hidden"
            style={{
              maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
              {[...trustTags, ...trustTags].map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ──────────────────────────────────────────────── */}
        <section className="px-4 py-16 sm:px-6">
          <Stagger className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { k: "0", l: "Seed phrases to write down" },
              { k: "100%", l: "Policies enforced on-chain" },
              { k: "M-of-N", l: "Guardian recovery threshold" },
              { k: "1 tap", l: "To sign any transaction" },
            ].map((s) => (
              <StaggerItem
                key={s.l}
                className="rounded-2xl border border-border bg-card/70 p-6 text-center shadow-elevated"
              >
                <p className="text-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">{s.k}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────── */}
        <section id="how-it-works" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
          <div className="absolute inset-0 -z-10 bg-dots opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="How it works"
              title="Up and running in minutes"
              blurb="No extension to install, no seed phrase to write down. Just a browser and your biometrics."
            />

            <div className="relative">
              {/* vertical rail (mobile) / horizontal rail (desktop) */}
              <motion.div
                aria-hidden
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute left-[27px] top-4 bottom-4 w-px origin-top bg-gradient-to-b from-primary via-violet-500 to-cyan-400 lg:hidden"
              />
              <Stagger className="grid gap-6 lg:grid-cols-4">
                {steps.map((s, i) => (
                  <StaggerItem key={s.step} className="group relative flex gap-5 lg:flex-col lg:gap-0">
                    <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-card text-primary shadow-elevated ring-4 ring-background transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <s.icon className="size-6" />
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        aria-hidden
                        className="absolute left-14 top-7 hidden h-px w-[calc(100%-3.5rem)] bg-gradient-to-r from-primary/60 to-transparent lg:block"
                      />
                    )}
                    <div className="lg:mt-6">
                      <span className="font-mono text-xs font-semibold text-primary">STEP {s.step}</span>
                      <h3 className="mt-1.5 text-lg font-semibold">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* ── FEATURES (bento) ───────────────────────────────────── */}
        <section id="features" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Features"
              title={
                <>
                  Everything you need, <span className="text-gradient">nothing you don&apos;t</span>
                </>
              }
              blurb="Built on open standards — WebAuthn, Soroban, Stellar — with no proprietary lock-in."
            />

            <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <StaggerItem key={f.title} className={f.span}>
                  <TiltCard max={5} className="group h-full">
                    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-elevated transition-colors duration-300 group-hover:border-primary/40">
                      <div
                        aria-hidden
                        className={`pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br ${f.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
                      />
                      <div
                        className={`relative mb-6 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                      >
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 to-transparent" />
                        <f.icon className="relative size-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                    </div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── ARCHITECTURE ───────────────────────────────────────── */}
        <section
          id="architecture"
          className="relative scroll-mt-24 border-y border-border/60 bg-muted/30 px-4 py-24 sm:px-6"
        >
          <AuroraBackground grid={false} spotlight={false} intensity={0.6} />
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Security model"
              title="Trust the math, not the middleman"
              blurb="Three layers, one guarantee: nobody but you can authorise a transaction — not the relay, not us."
            />
            <ArchitectureFlow />
          </div>
        </section>

        {/* ── CTA BANNER ─────────────────────────────────────────── */}
        <section className="px-4 py-24 sm:px-6">
          <Reveal className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-600 p-10 text-center text-white shadow-2xl sm:p-16">
              {/* shine sweep */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_35%,rgb(255_255_255/0.18)_50%,transparent_65%)] bg-[length:200%_100%]"
              />
              <div aria-hidden className="absolute -left-24 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
              <div aria-hidden className="absolute -bottom-32 -right-24 size-96 rounded-full bg-white/10 blur-2xl" />

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
                  className="mb-7 flex justify-center"
                >
                  <Image
                    src="/logo.png"
                    alt="Guardian Wallet"
                    width={64}
                    height={64}
                    className="rounded-2xl shadow-lg ring-4 ring-white/20"
                  />
                </motion.div>
                <h2 className="text-3xl font-extrabold text-balance sm:text-4xl lg:text-5xl">
                  Ready to ditch your seed phrase?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-lg text-white/85 text-balance">
                  Join the testnet early. Your feedback shapes what Guardian Wallet becomes on mainnet.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/create">
                    <Button
                      size="lg"
                      className="bg-white text-indigo-700 shadow-xl hover:bg-white/90 hover:shadow-2xl"
                    >
                      <Fingerprint data-icon="inline-start" />
                      Create Your Wallet
                    </Button>
                  </Link>
                  <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/40 bg-white/10 text-white hover:border-white/60 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20"
                    >
                      <GitBranch data-icon="inline-start" />
                      View on GitHub
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── DOCS ───────────────────────────────────────────────── */}
        <section id="docs" className="scroll-mt-24 border-y border-border/60 bg-muted/30 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Documentation"
              title="Open source & contributor-friendly"
              blurb="Every piece of this project is documented and open. Jump in."
            />

            <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {docs.map((d) => (
                <StaggerItem key={d.title}>
                  <a
                    href={d.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                  >
                    <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <d.icon className="size-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{d.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{d.description}</p>
                    <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-primary">
                      {d.label}
                      <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </a>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal className="mt-12 flex justify-center">
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-muted-foreground shadow-elevated transition-all hover:border-amber-400/60 hover:text-foreground"
              >
                <Star className="size-4 fill-amber-400 text-amber-400" />
                Star us on GitHub — it helps the project grow
                <ExternalLink className="size-3.5" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-24 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="FAQ"
              title="Common questions"
              blurb="Everything you need to know before you start."
            />
            <Stagger className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <StaggerItem key={faq.q}>
                  <FAQItem q={faq.q} a={faq.a} defaultOpen={i === 0} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="relative border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="mb-4 flex items-center gap-2.5">
                <Image src="/logo.png" alt="Guardian Wallet" width={30} height={30} className="rounded-lg" />
                <span className="font-bold">Guardian Wallet</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A passkey-secured, policy-governed smart wallet on the Stellar network. Built by Rayos Org.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href={GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  aria-label="GitHub"
                >
                  <GitBranch className="size-4" />
                </a>
                <ThemeToggle />
              </div>
            </div>

            <FooterCol
              title="App"
              links={[
                { href: "/create", label: "Create Wallet" },
                { href: "/login", label: "Sign In" },
                { href: "/recover", label: "Recover Wallet" },
              ]}
            />
            <FooterCol
              title="Documentation"
              external
              links={[
                { href: `${GITHUB}/blob/main/docs/SETUP.md`, label: "Setup Guide" },
                { href: `${GITHUB}/blob/main/docs/ARCHITECTURE.md`, label: "Architecture" },
                { href: `${GITHUB}/blob/main/docs/CONTRIBUTING.md`, label: "Contributing" },
                { href: `${GITHUB}/blob/main/docs/SECURITY.md`, label: "Security" },
              ]}
            />
            <FooterCol
              title="Legal & Community"
              external
              links={[
                { href: `${GITHUB}/blob/main/LICENSE`, label: "MIT License" },
                { href: `${GITHUB}/blob/main/docs/CODE_OF_CONDUCT.md`, label: "Code of Conduct" },
                { href: `${GITHUB}/issues`, label: "Report a Bug" },
                { href: `${GITHUB}/discussions`, label: "Discussions" },
              ]}
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Rayos Org. MIT License. Running on Stellar Testnet.</p>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              <span>Testnet live</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  links,
  external = false,
}: {
  title: string;
  links: { href: string; label: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <p className="mb-4 text-sm font-semibold">{title}</p>
      <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
        {links.map((l) =>
          external ? (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ) : (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
