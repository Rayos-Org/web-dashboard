/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { GuardianList } from "@/components/guardians/GuardianList";

vi.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({
    data: {
      exists: true,
      signers: [
        { credentialId: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", weight: 1 },
      ],
    },
    isLoading: false,
  }),
}));

const WALLET = "C" + "B".repeat(55);

test("renders GuardianList with visible Coming Soon badge and disabled action", () => {
  render(<GuardianList walletAddress={WALLET} />);
  expect(screen.getByText("Recovery Guardians")).toBeInTheDocument();
  expect(screen.getByText("Coming Soon")).toBeInTheDocument();

  const button = screen.getByRole("button", { name: /Add Guardian/i });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("title", "Guardian management ships with the next PolicyModule release");
});

test("renders informative alert with link to roadmap and tracking issues", () => {
  render(<GuardianList walletAddress={WALLET} />);
  expect(screen.getByText(/Guardian add\/remove and recovery execution go through the PolicyModule/i)).toBeInTheDocument();
  const link = screen.getByRole("link", { name: /GitHub Tracking Issues/i });
  expect(link).toHaveAttribute("href", "https://github.com/Rayos-Org/web-dashboard/issues");
});
