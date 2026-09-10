# Setting Up Guardian Wallet — Local Development

This guide gets the `web-dashboard` running on your machine from scratch.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org) | ≥ 22 LTS | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage versions |
| [pnpm](https://pnpm.io) | ≥ 9.x | `npm install -g pnpm` |
| A modern browser | Chrome 118+, Safari 17+, Firefox 122+ | Must support WebAuthn platform authenticators |
| A physical device or Touch ID / Face ID | — | Passkeys require a hardware authenticator — VMs without biometrics will fail the passkey step |

> **Windows users:** All commands below work in PowerShell or Git Bash. WSL2 is also fully supported.

---

## 1. Clone the repository

```bash
git clone https://github.com/Rayos-Org/web-dashboard.git
cd web-dashboard
```

---

## 2. Install dependencies

```bash
pnpm install
```

> `pnpm` uses a content-addressable store for deduplication. First install may take a minute; subsequent installs are near-instant.

---

## 3. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` in your editor:

```env
# URL of the deployed (or locally running) relay-backend
NEXT_PUBLIC_RELAY_BACKEND_URL=http://localhost:3001/api

# WebAuthn Relying Party ID — must match your dev domain exactly
# For localhost: "localhost"
# For production Vercel: "rayos-stellar-frontend.vercel.app"
NEXT_PUBLIC_WEBAUTHN_RP_ID=localhost

# Stellar smart contract IDs (testnet)
NEXT_PUBLIC_FACTORY_CONTRACT_ID=CCCAMWJOF7IYTVCU7SR6HFTNH5XRMDMWPYN464NY5BCKUPMUM64RZ5CH
NEXT_PUBLIC_POLICY_CONTRACT_ID=CCDM3O2SXX3E24MCWLRK5YBVQHJCA4OQKJFF6KWCK6FHZS65DGMT6DOY

# Soroban RPC endpoint
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Stellar network passphrase
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Server-side JWT secret — generate with: openssl rand -base64 32
SESSION_SECRET=replace_me_with_a_random_32+_character_string
```

### Variable reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_RELAY_BACKEND_URL` | ✅ | Base URL of the `relay-backend` (no trailing slash) |
| `NEXT_PUBLIC_WEBAUTHN_RP_ID` | ✅ | Must exactly match the domain serving the app |
| `NEXT_PUBLIC_FACTORY_CONTRACT_ID` | ✅ | 56-char Stellar contract address (wallet factory) |
| `NEXT_PUBLIC_POLICY_CONTRACT_ID` | ✅ | 56-char Stellar contract address (policy module) |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | ✅ | Soroban RPC endpoint |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | ✅ | Network identifier string |
| `SESSION_SECRET` | ✅ | Secret for signing JWTs (min. 32 chars, never commit) |

> ⚠️ All `NEXT_PUBLIC_*` variables are **exposed to the browser**. Never put secrets there.

---

## 4. (Optional) Run the relay-backend locally

The dashboard proxies requests to the `relay-backend`. For full local testing, clone and run it:

```bash
# In a separate terminal
git clone https://github.com/Rayos-Org/relay-backend.git
cd relay-backend
cp .env.example .env     # fill in Postgres URL and other vars
pnpm install
pnpm start:dev
```

Once running, set `NEXT_PUBLIC_RELAY_BACKEND_URL=http://localhost:3001/api` in your `.env.local`.

Alternatively, you can point `NEXT_PUBLIC_RELAY_BACKEND_URL` at the public testnet relay URL from `.env.local.example` — this works for most UI development tasks without running the backend locally.

---

## 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The server uses **Turbopack** for fast HMR.

---

## 6. Run the test suite

```bash
# Unit / component tests (Vitest + Testing Library)
pnpm test --run

# E2E tests (Playwright — starts a local dev server automatically)
pnpm test:e2e
```

---

## 7. Typecheck and lint

```bash
pnpm tsc --noEmit    # TypeScript strict check
pnpm lint            # ESLint (Next.js + TypeScript rules)
```

All four commands must pass before opening a PR. The CI pipeline enforces this automatically.

---

## Troubleshooting

### "Invalid environment variables" on startup

Your `.env.local` is missing or has malformed values. Re-check against the variable table above. All variables are required.

### Passkey prompt never appears / fails silently

- Your browser or OS does not support WebAuthn platform authenticators — try Chrome or Safari on a device with biometrics.
- In Chrome on macOS, make sure **Touch ID for the web** is enabled in `chrome://settings/privacy`.
- The `NEXT_PUBLIC_WEBAUTHN_RP_ID` must match the domain you are accessing. For `localhost`, use `localhost`. Mismatches cause silent failures.

### "Bad Gateway" errors from the API proxy

The dashboard cannot reach the relay-backend. Verify `NEXT_PUBLIC_RELAY_BACKEND_URL` is correct and the backend is running/accessible.

### `pnpm install` fails on Node version

Run `node --version` and confirm it is ≥ 22. Use `nvm use 22` or `fnm use 22` to switch.

---

## Next steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand how the codebase is structured
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request
- Browse [open issues](https://github.com/Rayos-Org/web-dashboard/issues) for tasks tagged `good first issue`
