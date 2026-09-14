import { test, expect } from "@playwright/test";
import { rpc } from "@stellar/stellar-sdk";

/**
 * Full real flow on Stellar testnet through the dashboard: create wallet
 * (WebAuthn registration + factory deploy), faucet, passkey-signed send that
 * the wallet contract verifies on-chain, sign out and sign back in.
 *
 * Uses Chrome's virtual authenticator (CDP WebAuthn domain), so the passkey
 * ceremony is genuine — nothing in the stack is mocked. Needs a running relay
 * (see relay-backend/.env.example) and `.env` pointing the dashboard at it.
 *
 *   E2E_TESTNET=1 pnpm test:e2e --project=chromium tests/testnet-flow.spec.ts
 */
const ENABLED = process.env.E2E_TESTNET === "1";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";

test.describe("testnet wallet flow", () => {
  test.skip(!ENABLED, "set E2E_TESTNET=1 with a live relay to run");
  test.skip(({ browserName }) => browserName !== "chromium", "virtual authenticator is Chromium-only");
  test.setTimeout(10 * 60 * 1000);

  test("create → fund → passkey-signed send → re-login", async ({ page, context }) => {
    const cdp = await context.newCDPSession(page);
    await cdp.send("WebAuthn.enable");
    const { authenticatorId } = await cdp.send("WebAuthn.addVirtualAuthenticator", {
      options: {
        protocol: "ctap2",
        transport: "internal",
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
        automaticPresenceSimulation: true,
      },
    });

    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    // 1. Create wallet (wait for hydration before the first click)
    await page.goto(`${BASE}/create`, { waitUntil: "networkidle" });
    await page.getByLabel(/Wallet Name/i).fill("E2E Wallet");
    await page.getByRole("button", { name: /Continue/ }).click();
    await page.getByRole("button", { name: /Create Passkey/ }).click();
    await expect(page.getByRole("button", { name: /Creating/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Wallet Deployed!"), errors.join("; ")).toBeVisible({
      timeout: 90_000,
    });
    const address = (await page.locator("code").first().innerText()).trim();
    expect(address).toMatch(/^C[A-Z2-7]{55}$/);
    const { credentials } = await cdp.send("WebAuthn.getCredentials", { authenticatorId });
    expect(credentials).toHaveLength(1);

    // 2. Dashboard shows the deployed-but-unfunded contract
    await page.getByRole("button", { name: /Go to Dashboard/ }).click();
    await page.waitForURL(/\/wallet/, { timeout: 30_000 });
    await expect(page.getByText("Unfunded")).toBeVisible({ timeout: 60_000 });

    // 3. Faucet
    await page.getByRole("button", { name: /Get testnet XLM/ }).first().click();
    await expect(page.locator("p.text-5xl").first()).not.toHaveText(/^0\.00/, { timeout: 90_000 });

    // 4. Send 2.5 XLM back to the relay sponsor (passkey signs the auth entry)
    const info = await (await page.request.get(`${BASE}/api/relay/info`)).json();
    await page.getByRole("button", { name: /^Send$/ }).click();
    await page.getByLabel(/Recipient Address/).fill(info.publicKey);
    await page.getByLabel(/Amount/).fill("2.5");
    await page.getByRole("button", { name: /Sign & Send/ }).click();
    await expect(page.getByText(/Sent 2.5 XLM/)).toBeVisible({ timeout: 120_000 });
    const sendTx = (await page.locator("code.break-all").first().innerText()).trim();
    expect(sendTx).toMatch(/^[0-9a-f]{64}$/);
    await page.getByRole("button", { name: /^Close$/ }).last().click();

    // 5. Activity reflects the transfer
    await expect(page.getByText(/Sent to/).first()).toBeVisible({ timeout: 60_000 });

    // 6. Sign out, sign back in with the same passkey
    await context.clearCookies();
    await page.goto(`${BASE}/login`);
    await page.getByRole("button", { name: /Sign in with Passkey/ }).click();
    await page.waitForURL(/\/wallet/, { timeout: 60_000 });

    // Independent on-chain confirmation
    const server = new rpc.Server(RPC_URL);
    const tx = await server.getTransaction(sendTx);
    expect(tx.status).toBe("SUCCESS");
  });
});
