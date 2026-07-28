// Test setup for Vitest
import { beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock localStorage for tests
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
}
// @ts-expect-error - global localStorage
global.localStorage = localStorageMock

// Mock console methods
beforeEach(() => {
  // @ts-expect-error - vi.fn in test context
  console.log = vi.fn()
  // @ts-expect-error - vi.fn in test context
  console.error = vi.fn()
  // @ts-expect-error - vi.fn in test context
  console.warn = vi.fn()
})
