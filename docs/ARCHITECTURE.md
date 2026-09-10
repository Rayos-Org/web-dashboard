# Architecture — `web-dashboard`

> **Scope:** The Next.js 16 application that is the primary user interface for Guardian Wallet. It handles all user-facing flows: account creation, wallet management, policy configuration, and social recovery.

---

## 1. Position in the Rayos Ecosystem

Guardian Wallet is split across four repositories. This repo — `web-dashboard` — is the user-facing frontend only.

```
┌──────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│                      web-dashboard (this)                        │
│         Next.js 16 · React 19 · shadcn/ui · Tailwind CSS v4     │
└────────────────────────┬─────────────────────────────────────────┘
                         │  HTTP (proxied via /api/* route handlers)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                   relay-backend (NestJS)                        │
│   WebAuthn · Sessions · Recovery · Indexer · Fee Sponsorship   │
└────────────────┬───────────────────────────────────────────────┘
                 │  Soroban XDR / RPC
                 ▼
┌────────────────────────────────────────────────────────────────┐
│              wallet-contracts (Soroban / Rust)                  │
│        GuardianWallet · PolicyModule · RecoveryModule           │
└────────────────────────────────────────────────────────────────┘
                 │  Infrastructure as Code
                 ▼
┌────────────────────────────────────────────────────────────────┐
│                       infra (Terraform)                          │
│            Render · Vercel · NeonDB · Cloudflare                │
└────────────────────────────────────────────────────────────────┘
```

| Repository | Role |
|------------|------|
| **`web-dashboard`** (this) | Next.js frontend — the UI and API proxy layer |
| [`relay-backend`](https://github.com/Rayos-Org/relay-backend) | NestJS backend — WebAuthn, fee relay, indexer, sessions, recovery |
| [`wallet-contracts`](https://github.com/Rayos-Org/wallet-contracts) | Soroban smart contracts — wallet logic, spend limits, recovery |
| [`infra`](https://github.com/Rayos-Org/infra) | Terraform IaC — all deployment config |

---

## 2. Tech Stack

| Category | Technology | Why |
|----------|-----------|-----|
| Framework | Next.js 16 (App Router) | SSR, file-based routing, Server Components, Route Handlers |
| UI Library | React 19 | Concurrent features, use hook |
| Component system | shadcn/ui (Base UI primitives) | Unstyled, accessible, composable |
| Styling | Tailwind CSS v4 | Utility-first, co-located styles, zero dead CSS |
| State — server | TanStack React Query v5 | Caching, background refetch, optimistic updates |
| State — local | Zustand | Minimal client UI state (sidebar, active tab) |
| Auth | WebAuthn / Passkeys via `@simplewebauthn/browser` | No passwords, phishing-resistant |
| Session | JWT in httpOnly cookie via `jose` | Stateless, secure, short-lived (2h) |
| Wallet SDK | `@rayos/wallet-sdk` | Soroban contract interactions, passkey signing |
| Fonts | Geist Sans + Geist Mono | Clean, modern, numeric-friendly |
| Accent colour | `#D97706` (Amber 600) | Single-token brand, legible on both light/dark |
| Deployment | Vercel | Zero-config Next.js, edge runtime, preview deployments |
| Package manager | pnpm | Fast, disk-efficient, strict peer dep resolution |

---

## 3. Directory Structure

```
web-dashboard/
│
├── app/                              ← Next.js App Router root
│   ├── (onboarding)/                 ← Route group — no shared auth layout
│   │   ├── create/page.tsx           ← 3-step wallet creation (passkey → deploy → done)
│   │   ├── login/page.tsx            ← Passkey assertion → JWT cookie → redirect
│   │   ├── recover/page.tsx          ← Lost-device recovery flow (no auth required)
│   │   ├── recover/[proposalId]/
│   │   │   └── approve/page.tsx      ← Public guardian approval link
│   │   └── layout.tsx                ← Centered card shell, WebAuthn feature check
│   │
│   ├── (dashboard)/                  ← Route group — requires valid session
│   │   ├── wallet/page.tsx           ← Balance, signers, transaction history
│   │   ├── policies/page.tsx         ← Spend limits, session keys, allow-list
│   │   ├── guardians/page.tsx        ← Guardian list, recovery status
│   │   └── layout.tsx                ← Auth check → redirect, sidebar, mobile header
│   │
│   ├── api/                          ← Next.js Route Handlers (thin proxy layer)
│   │   ├── webauthn/                 ← /register/options, /register/verify, /assert/*
│   │   ├── sessions/                 ← GET (list), POST (create), DELETE (revoke)
│   │   ├── wallets/[credentialId]/   ← Resolve credential ID → wallet address
│   │   ├── recovery/                 ← /propose, /approve, /[proposalId], /status
│   │   └── relay/status/[txHash]/   ← Poll transaction status
│   │
│   ├── actions/
│   │   └── auth.ts                   ← Server Actions: loginAction, logoutAction
│   │
│   ├── globals.css                   ← Tailwind v4 config, CSS custom properties, brand tokens
│   ├── layout.tsx                    ← Root layout: fonts, QueryClientProvider, Toaster
│   ├── page.tsx                      ← Landing / marketing page
│   └── icon.png                      ← App favicon (logo.png copy)
│
├── components/
│   ├── ui/                           ← shadcn/ui generated primitives (DO NOT edit directly)
│   │   └── button.tsx, card.tsx, dialog.tsx, badge.tsx, ...
│   │
│   ├── wallet/
│   │   ├── BalanceCard.tsx           ← Live XLM balance, account status, Friendbot link
│   │   ├── QuickSend.tsx             ← Send dialog: recipient, amount, passkey signing
│   │   ├── SignersCard.tsx           ← On-chain passkey signer list with weights
│   │   ├── TransactionList.tsx       ← Real ops feed from Horizon API
│   │   └── PasskeyPrompt.tsx         ← Reusable biometric prompt UI
│   │
│   ├── policies/
│   │   ├── SpendLimitForm.tsx        ← Set rolling spend cap via SDK session key
│   │   ├── SessionKeyList.tsx        ← List, create (with real passkey sig), revoke
│   │   └── AllowListEditor.tsx       ← Toggle + add/remove contract allow-list
│   │
│   ├── guardians/
│   │   ├── GuardianList.tsx          ← On-chain signer management (add/remove)
│   │   └── RecoveryStatusBanner.tsx  ← Active recovery proposal alert + cancel
│   │
│   └── Providers.tsx                 ← TanStack Query provider wrapper
│
├── hooks/                            ← React Query hooks — all data fetching lives here
│   ├── useWallet.ts                  ← getWalletState, sendTransaction, formatXLM
│   ├── usePolicies.ts                ← useSessionKeys, useCreateSessionKey, useRevokeSessionKey
│   ├── useRecovery.ts                ← useRecoveryProposal, useProposeRecovery, useApproveRecovery
│   └── useTransactions.ts           ← Horizon API: useTransactions, useTransactionStatus, useAccountExists
│
├── lib/
│   ├── auth.ts                       ← JWT encrypt/decrypt, createSession, getSession, destroySession
│   ├── config.ts                     ← Zod-validated env vars (throws on missing)
│   ├── proxy.ts                      ← Generic proxyToRelay() used by all /api/* route handlers
│   ├── sdk-client.ts                 ← Singleton WalletSdk instance
│   └── utils.ts                      ← cn() Tailwind class merge helper
│
├── store/
│   └── ui.ts                         ← Zustand store: sidebarOpen, activeTab
│
├── __tests__/                        ← Vitest unit / component tests
│   └── components/policies/
│       └── SpendLimitForm.test.tsx
│
├── tests/                            ← Playwright E2E tests
│   └── onboarding.spec.ts
│
├── docs/                             ← Contributor documentation (you are here)
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   ├── CONTRIBUTING.md
│   ├── TESTING.md
│   ├── SECURITY.md
│   └── CODE_OF_CONDUCT.md
│
├── .github/
│   ├── workflows/ci.yml              ← GitHub Actions: tsc · lint · vitest · playwright
│   ├── ISSUE_TEMPLATE/               ← Bug report, feature request, docs templates
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .env.local.example                ← Template for local environment variables
├── next.config.ts                    ← Next.js config (minimal)
├── tailwind.config.ts                ← (resolved from globals.css @theme block)
├── eslint.config.mjs                 ← ESLint flat config (Next.js + TypeScript)
├── tsconfig.json                     ← TypeScript strict config + path aliases
├── vitest.config.ts                  ← Vitest config
├── playwright.config.ts              ← Playwright config (3 browsers, dev server)
└── package.json
```

---

## 4. Key Design Decisions

### No direct RPC from components
Every wallet interaction goes through `hooks/*` → `@rayos/wallet-sdk`. Components are dumb — they render, dispatch mutations, and show loading/error states. Upgrading the SDK touches `hooks/`, not the component tree.

### API proxy layer
The browser never calls the relay-backend directly. All backend calls go through Next.js Route Handlers (`app/api/*`) via `lib/proxy.ts`. This eliminates CORS issues, allows server-side cookie reading, and gives us a place to add auth headers to backend calls.

### JWT sessions, not re-authentication
After WebAuthn assertion succeeds, a short-lived JWT (2h) is stored in an `httpOnly`, `secure`, `SameSite=lax` cookie. Subsequent page loads read the cookie — the user is not prompted for their passkey on every navigation.

### Horizon API for transaction history
The relay-backend does not expose a transaction history endpoint (it only handles relay submission). On-chain transaction history is fetched directly from the **Stellar Horizon REST API** (`horizon-testnet.stellar.org`) from the browser — this is public data requiring no authentication.

### Zero mock data in production paths
A firm project rule: no `setTimeout` fakes, no hardcoded addresses, no dummy signatures. Mocking is allowed only in test files (`__tests__/`, `vitest.setup.ts`).

---

## 5. Request Lifecycle

### Wallet creation
```
Browser → /create → startRegistration() (browser prompt)
       → POST /api/webauthn/register/options  → relay-backend
       → POST /api/webauthn/register/verify   → relay-backend
       → walletSdk.createWallet(options, salt) → Soroban deploy tx
       → POST /actions/auth.ts loginAction()   → sets JWT cookie
       → redirect /wallet
```

### Sending a transaction
```
/wallet → QuickSend dialog
       → POST /api/webauthn/assert/options    → relay-backend
       → startAuthentication() (browser prompt)
       → walletSdk.signAndSubmit(xdr, opts)   → relay-backend → Stellar network
       → GET /api/relay/status/:txHash        → poll until success/fail
```

### Session key creation
```
/policies → SessionKeyList dialog
          → POST /api/webauthn/assert/options → relay-backend
          → startAuthentication()              → returns real signature
          → POST /api/sessions { ..., signature } → relay-backend stores key
```

---

## 6. Data Flow Diagram

```
React Component
     │  useQuery / useMutation
     ▼
React Query Cache ──────────── staleTime: 15s–30s
     │
     ▼
hooks/* (useWallet, usePolicies, …)
     │
     ├──── wallet SDK calls ──────────► @rayos/wallet-sdk
     │                                        │ Soroban RPC
     │                                        ▼
     │                                  Stellar Testnet
     │
     ├──── backend API calls ─────────► /api/* Route Handlers
     │                                        │ proxyToRelay()
     │                                        ▼
     │                                  relay-backend
     │
     └──── Horizon calls ─────────────► horizon-testnet.stellar.org
                                        (transaction history, account status)
```

---

## 7. Environment Variables

All required env vars are documented in [SETUP.md → Variable reference](./SETUP.md#variable-reference). The `lib/config.ts` module uses Zod to validate them at startup — the server will refuse to start if any are missing or malformed.

---

## 8. Dependencies on Other Repos

| Dependency | How it's consumed |
|------------|-------------------|
| `wallet-contracts` | Indirectly — the SDK talks to the deployed contract addresses configured in env vars |
| `relay-backend` | Directly — all `app/api/*` route handlers proxy to its REST API |
| `@rayos/wallet-sdk` | npm package — pinned in `package.json` |
| `infra` | Owns Vercel and Render deployment config — not imported, but must be updated when env vars change |

---

## 9. shadcn/ui Conventions

- Install new components: `pnpm dlx shadcn@latest add <component>`
- **Never hand-edit files in `components/ui/`** — they are regenerated on shadcn updates
- Wrap and extend in domain folders: `components/wallet/`, `components/policies/`, etc.
- Use `cn()` from `lib/utils` for conditional class merging — never template literals
