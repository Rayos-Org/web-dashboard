/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import { SpendLimitForm } from '@/components/policies/SpendLimitForm'

// Mock the wallet SDK used inside SpendLimitForm
vi.mock('@/lib/sdk-client', () => ({
  walletSdk: {
    createSessionKey: vi.fn().mockResolvedValue({}),
  },
}))

// Mock @simplewebauthn/browser startAuthentication
vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: vi.fn().mockResolvedValue({
    id: 'mock-credential-id',
    response: {
      authenticatorData: 'bW9jawAA',
      signature: 'bW9ja1NpZw==',
    },
  }),
}))

// Mock the webauthn options API call
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ challenge: 'mock-challenge' }),
})

vi.mock('@/components/wallet/PasskeyPrompt', () => ({
  PasskeyPrompt: ({ message }: { message: string }) => (
    <div data-testid="passkey-prompt">{message}</div>
  ),
}))

test('renders the SpendLimitForm with title and submit button', () => {
  render(<SpendLimitForm walletAddress="GBCXMOCK123456789012345678901234567890123456789012345678" />)
  const elements = screen.getAllByText('Set Spend Limit')
  expect(elements.length).toBeGreaterThanOrEqual(1)
})

test('disables submit button when amount is empty', () => {
  render(<SpendLimitForm walletAddress="GBCXMOCK123456789012345678901234567890123456789012345678" />)
  const button = screen.getByRole('button', { name: /set spend limit/i })
  expect(button).toBeDisabled()
})

test('enables submit button when amount is filled', async () => {
  render(<SpendLimitForm walletAddress="GBCXMOCK123456789012345678901234567890123456789012345678" />)

  const input = screen.getByPlaceholderText('100.00')
  fireEvent.change(input, { target: { value: '50' } })

  const button = screen.getByRole('button', { name: /set spend limit/i })
  expect(button).not.toBeDisabled()
})
