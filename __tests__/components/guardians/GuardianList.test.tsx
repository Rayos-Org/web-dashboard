/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { GuardianList } from "@/components/guardians/GuardianList";

const mockAddGuardian = vi.fn().mockResolvedValue({
  txHash: "mocktx9876543210abcdef",
  status: "SUCCESS",
});

const mockRemoveGuardian = vi.fn().mockResolvedValue({
  txHash: "mocktxremoved123456",
  status: "SUCCESS",
});

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

vi.mock("@/hooks/usePolicies", () => ({
  useAddGuardian: () => ({
    mutateAsync: mockAddGuardian,
    isPending: false,
  }),
  useRemoveGuardian: () => ({
    mutateAsync: mockRemoveGuardian,
    isPending: false,
  }),
}));

const WALLET = "C" + "B".repeat(55);
const GUARDIAN = "G" + "A".repeat(55);

test("renders GuardianList with visible Policy Active badge and enabled Add Guardian button", () => {
  render(<GuardianList walletAddress={WALLET} credentialId="cred-456" />);
  expect(screen.getByText("Recovery Guardians")).toBeInTheDocument();
  expect(screen.getByText("Policy Active")).toBeInTheDocument();

  const button = screen.getByRole("button", { name: /Add Guardian/i });
  expect(button).not.toBeDisabled();
});

test("renders recovery threshold and active signers", () => {
  render(<GuardianList walletAddress={WALLET} credentialId="cred-456" />);
  expect(screen.getByText("Recovery Threshold")).toBeInTheDocument();
  expect(screen.getByText("1 of 1")).toBeInTheDocument();
  expect(screen.getByText(/Passkey signer · P-256/i)).toBeInTheDocument();
});

test("opens Add Guardian dialog and submits valid Stellar address", async () => {
  render(<GuardianList walletAddress={WALLET} credentialId="cred-456" />);
  const addButton = screen.getByRole("button", { name: /Add Guardian/i });
  fireEvent.click(addButton);

  expect(screen.getByText("Add Recovery Guardian")).toBeInTheDocument();

  const input = screen.getByLabelText(/Guardian Stellar Address/i);
  fireEvent.change(input, { target: { value: GUARDIAN } });

  const submitButton = screen.getByRole("button", { name: /Authorize & Add/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(mockAddGuardian).toHaveBeenCalledWith(
      expect.objectContaining({
        walletAddress: WALLET,
        guardianAddress: GUARDIAN,
        credentialId: "cred-456",
      })
    );
  });
});
