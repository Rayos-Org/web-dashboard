/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { SpendLimitForm } from "@/components/policies/SpendLimitForm";

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}));

const WALLET = "C" + "A".repeat(55);

test("renders the spend-limit form as an honest preview (policy module owner-gated on testnet)", () => {
  render(<SpendLimitForm walletAddress={WALLET} />);
  expect(screen.getByText("Spend Limit")).toBeInTheDocument();
  expect(screen.getByText("Preview")).toBeInTheDocument();
  expect(screen.getByText(/owner-gated/i)).toBeInTheDocument();
});

test("does not claim to submit anything on-chain", () => {
  render(<SpendLimitForm walletAddress={WALLET} />);
  const button = screen.getByRole("button", { name: /Set Spend Limit/i });
  expect(button).toBeDisabled();
  expect(screen.queryByText(/set on-chain/i)).not.toBeInTheDocument();
});
