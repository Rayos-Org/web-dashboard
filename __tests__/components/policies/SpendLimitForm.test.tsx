/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { SpendLimitForm } from "@/components/policies/SpendLimitForm";

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, defaultValue }: any) => (
    <div data-testid="select">{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div role="button">{children}</div>,
  SelectValue: () => <span>Select Window</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

const mockSetSpendLimit = vi.fn().mockResolvedValue({
  txHash: "mocktx1234567890abcdef",
  status: "SUCCESS",
});

vi.mock("@/hooks/usePolicies", () => ({
  useSpendLimit: vi.fn(() => ({
    data: {
      amount: 1000000000n, // 100 XLM
      windowSecs: 86400n,
      currentAccumulated: 200000000n, // 20 XLM
      currentWindowStart: 1700000000n,
    },
    isLoading: false,
  })),
  useSetSpendLimit: () => ({
    mutateAsync: mockSetSpendLimit,
    isPending: false,
  }),
}));

const WALLET = "C" + "A".repeat(55);

test("renders active spend policy with on-chain enforcement badge", () => {
  render(<SpendLimitForm walletAddress={WALLET} credentialId="cred-123" />);
  expect(screen.getByText("Active Spend Policy")).toBeInTheDocument();
  expect(screen.getByText("Enforced On-Chain")).toBeInTheDocument();
  expect(screen.getByText(/100\.00/)).toBeInTheDocument();
  expect(screen.getByText(/Remaining allowance:/i)).toBeInTheDocument();
  expect(screen.getByText("80.00 XLM")).toBeInTheDocument();
});

test("allows entering amount and submitting to set spend limit", async () => {
  render(<SpendLimitForm walletAddress={WALLET} credentialId="cred-123" />);
  const input = screen.getByLabelText(/Limit Amount/i);
  fireEvent.change(input, { target: { value: "50" } });

  const button = screen.getByRole("button", { name: /Set Spend Limit/i });
  expect(button).not.toBeDisabled();

  fireEvent.click(button);

  await waitFor(() => {
    expect(mockSetSpendLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        walletAddress: WALLET,
        amount: 500000000n, // 50 XLM in stroops
        credentialId: "cred-123",
      })
    );
  });
});
