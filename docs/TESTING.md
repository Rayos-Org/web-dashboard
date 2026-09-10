# Testing Guide — `web-dashboard`

This document explains the testing strategy, tooling, and how to write new tests.

---

## Overview

| Layer | Tool | What it covers |
|-------|------|----------------|
| Unit / Component | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) | Individual hooks and form components |
| End-to-End | [Playwright](https://playwright.dev) | Full user flows across Chrome, Firefox, WebKit |
| Type safety | TypeScript `strict` | Compile-time correctness |
| Static analysis | ESLint | Code quality, import hygiene |

---

## Running Tests

```bash
# All unit/component tests (single run)
pnpm test --run

# Unit tests in watch mode (during development)
pnpm test

# E2E tests (starts dev server automatically)
pnpm test:e2e

# E2E with Playwright UI (useful for debugging)
pnpm test:e2e --ui

# Typecheck only
pnpm tsc --noEmit

# Lint only
pnpm lint
```

---

## Unit / Component Tests (Vitest)

Files live in `__tests__/` and mirror the directory structure they test:

```
__tests__/
└── components/
    └── policies/
        └── SpendLimitForm.test.tsx
```

### Setup

Global test setup is in [`vitest.setup.ts`](../vitest.setup.ts). It:
- Mocks `@/lib/config` to avoid crashes from missing env vars
- Mocks `window.matchMedia` (needed for responsive Tailwind components in jsdom)
- Extends `expect` with `@testing-library/jest-dom/vitest` matchers

### Writing a component test

```tsx
/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import { MyComponent } from '@/components/wallet/MyComponent'

// Mock external dependencies — never mock the component under test
vi.mock('@/lib/sdk-client', () => ({
  walletSdk: {
    getWalletState: vi.fn().mockResolvedValue({ balance: 10_000_000n, signers: [] }),
  },
}))

test('renders balance correctly', () => {
  render(<MyComponent walletAddress="G..." />)
  expect(screen.getByText(/1\.00 XLM/i)).toBeInTheDocument()
})
```

### Rules for unit tests

- **Query by role or label** (`getByRole`, `getByLabelText`) — not by class or test ID.
- **Mock at the boundary** — mock SDK and fetch calls, not internal helpers.
- **No mock data in tests either** — use realistic stub values (real-looking Stellar addresses, real ISO timestamps).
- **Test behaviour, not implementation** — verify what the user sees, not which functions were called.

---

## E2E Tests (Playwright)

Files live in `tests/`:

```
tests/
├── onboarding.spec.ts    # Registration and login flows
└── example.spec.ts       # Smoke tests (delete once real tests cover the same ground)
```

### Configuration

[`playwright.config.ts`](../playwright.config.ts) configures:
- Browsers: Chromium, Firefox, WebKit
- Base URL: `http://localhost:3000` (dev server started automatically)
- Screenshot and video on failure

### Writing an E2E test

```ts
import { test, expect } from '@playwright/test'

test('landing page loads and shows hero CTA', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /secured by your face/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /create wallet/i })).toBeVisible()
})
```

### Passkey in E2E

WebAuthn hardware prompts cannot be automated in headless browsers without a virtual authenticator. Our E2E tests use Playwright's [Virtual Authenticator API](https://playwright.dev/docs/api/class-browsercontext#browser-context-add-init-script) to simulate passkey registration and assertion without a real device:

```ts
// In your test file
const client = await page.context().newCDPSession(page)
await client.send('WebAuthn.enable')
await client.send('WebAuthn.addVirtualAuthenticator', {
  options: {
    protocol: 'ctap2',
    transport: 'internal',
    hasResidentKey: true,
    hasUserVerification: true,
    isUserVerified: true,
  },
})
```

---

## CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR to `main`:

1. `pnpm tsc --noEmit` — TypeScript strict check
2. `pnpm lint` — ESLint
3. `pnpm test --run` — Vitest unit tests
4. `pnpm test:e2e` — Playwright across 3 browsers

All four gates must pass before a PR can be merged.

---

## Adding Tests for New Features

When you add a new feature or fix a bug:

1. **New form component** → add a Vitest test covering empty state, validation, and submit behaviour.
2. **New hook** → add a Vitest test mocking the SDK/fetch layer and verifying returned values.
3. **New page / user flow** → add a Playwright spec covering the happy path.
4. **Bug fix** → add a regression test that would have caught the bug.

If you are unsure what to test, ask in the PR and a maintainer will guide you.
