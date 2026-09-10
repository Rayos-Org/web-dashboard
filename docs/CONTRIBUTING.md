# Contributing to Guardian Wallet — `web-dashboard`

Thank you for your interest in contributing! This guide covers everything you need to know to go from idea to merged pull request.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
3. [Development Setup](#development-setup)
4. [Branch & Commit Conventions](#branch--commit-conventions)
5. [Coding Conventions](#coding-conventions)
6. [No Mock Data](#no-mock-data)
7. [Pull Request Process](#pull-request-process)
8. [Testing Requirements](#testing-requirements)
9. [Review SLA](#review-sla)

---

## Code of Conduct

This project follows our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating you agree to uphold it. Report unacceptable behaviour to the maintainers.

---

## How to Contribute

### 🐛 Reporting bugs
Open a [Bug Report issue](.github/ISSUE_TEMPLATE/bug_report.yml). Include steps to reproduce, expected vs. actual behaviour, and any console errors.

### ✨ Requesting features
Open a [Feature Request issue](.github/ISSUE_TEMPLATE/feature_request.yml). Describe the problem it solves, not just the solution.

### 📖 Improving documentation
Open a [Documentation issue](.github/ISSUE_TEMPLATE/documentation.yml) or send a PR directly — docs PRs are always welcome.

### 💻 Writing code
1. Check [open issues](https://github.com/Rayos-Org/web-dashboard/issues) — especially ones labelled `good first issue` or `help wanted`.
2. Comment on the issue to claim it before starting work, so we avoid duplicate efforts.
3. Fork the repo, create a branch, write code, open a PR.

---

## Development Setup

See [SETUP.md](./SETUP.md) for the full guide. Quick version:

```bash
git clone https://github.com/Rayos-Org/web-dashboard.git
cd web-dashboard
pnpm install
cp .env.local.example .env.local   # fill in values
pnpm dev
```

---

## Branch & Commit Conventions

### Branches

| Pattern | Use for |
|---------|---------|
| `feat/short-description` | New features |
| `fix/short-description` | Bug fixes |
| `docs/short-description` | Documentation only |
| `chore/short-description` | Tooling, deps, CI |
| `refactor/short-description` | Refactors with no behaviour change |
| `test/short-description` | Test-only changes |

All branches must be cut from `main` and must target `main` in the PR.

### Commits

We follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <short imperative summary>

[optional body]

[optional footer: Closes #<issue>]
```

**Types:** `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `ci`

**Scope examples:** `wallet` · `policies` · `guardians` · `recovery` · `auth` · `hooks` · `ci`

```
feat(wallet): add real-time transaction feed via Horizon API
fix(auth): prevent JWT cookie being set on failed passkey assertion
docs(setup): add troubleshooting section for WebAuthn on Linux
```

---

## Coding Conventions

### TypeScript

- **Strict mode is on.** No `any` without a comment explaining why. Prefer `unknown` + type guards.
- Export types and interfaces from the same file as their implementation.
- Use `z.infer<typeof Schema>` for runtime-validated types (Zod) — don't duplicate type definitions.

### React / Next.js

- All client-interactive components must be `"use client"`.
- Server Components and Route Handlers (`app/api/*`) run **server-side only** — never import browser-specific APIs there.
- Data fetching lives in `hooks/*` (React Query) — components must not call `fetch` directly.
- No inline styles. Use Tailwind utility classes. Custom design tokens go in `globals.css`.

### Components

- Every new UI primitive comes from [shadcn/ui](https://ui.shadcn.com) — install with `pnpm dlx shadcn@latest add <component>`.
- Wrap and extend shadcn primitives in `components/wallet/`, `components/policies/`, etc. **Never hand-edit files in `components/ui/`**.
- Use `cn()` (from `lib/utils`) for conditional class names — not template literals.

### API Proxies

- The dashboard never calls the relay-backend directly from the browser — all backend calls go through `app/api/*` Route Handlers via `lib/proxy.ts`.
- Never put secret values in `NEXT_PUBLIC_*` env vars.

---

## No Mock Data

> **This is a hard rule.**

The codebase must contain **zero** mock, dummy, placeholder, or hardcoded data in production code paths. Specifically:

- ❌ No `setTimeout` fakes simulating async operations
- ❌ No hardcoded addresses like `"GBCX...AAAA"` or `"G_MOCK_..."`
- ❌ No placeholder strings like `"AAAA_PLACEHOLDER_XDR"` or `"dummy_signature_for_now"`
- ❌ No `return []` or `return null` stubs with `// TODO` comments

**The only acceptable mocking** is inside `__tests__/` and `vitest.setup.ts` — test-time mocks via `vi.mock()`.

PRs that introduce mock data into production code paths will be requested changes on.

---

## Pull Request Process

1. Make sure `pnpm tsc --noEmit`, `pnpm lint`, `pnpm test --run`, and `pnpm build` all pass locally before pushing.
2. Open the PR against `main`. Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md) — fill in every section.
3. Link the issue it resolves with `Closes #<number>`.
4. For UI changes, include a screenshot or screen recording.
5. Request a review from a maintainer. Do not self-merge.
6. Address review comments within 7 days or the PR may be closed.

---

## Testing Requirements

| Test type | Tool | Command | Required? |
|-----------|------|---------|-----------|
| Unit / component | Vitest + Testing Library | `pnpm test --run` | ✅ Yes — for all new hooks and form components |
| E2E | Playwright | `pnpm test:e2e` | ✅ Yes — for new user flows |
| Type check | TypeScript | `pnpm tsc --noEmit` | ✅ Always |
| Lint | ESLint | `pnpm lint` | ✅ Always |

See [TESTING.md](./TESTING.md) for detailed guidance on writing tests.

---

## Review SLA

| Action | Target time |
|--------|------------|
| First review or feedback | Within 3 business days |
| Re-review after changes | Within 2 business days |
| Merge after approval | Within 1 business day |

We aim to be responsive and constructive. If you have not heard back after 5 business days, leave a comment on the PR to ping the maintainers.

---

Thank you for making Guardian Wallet better! 🛡️
