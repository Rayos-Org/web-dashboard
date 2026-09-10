import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock matchMedia for window
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Mock config to prevent throws on undefined env vars during tests
vi.mock('@/lib/config', () => ({
  config: {
    NEXT_PUBLIC_RELAY_BACKEND_URL: 'http://localhost:3000',
    NEXT_PUBLIC_WEBAUTHN_RP_ID: 'localhost',
    NEXT_PUBLIC_FACTORY_CONTRACT_ID: 'TEST',
    NEXT_PUBLIC_POLICY_CONTRACT_ID: 'TEST',
    NEXT_PUBLIC_SOROBAN_RPC_URL: 'http://localhost',
    NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
  }
}))
