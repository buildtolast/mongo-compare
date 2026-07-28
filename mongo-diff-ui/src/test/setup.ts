// Test setup for Vitest
import { beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock localStorage for tests
const createLocalStorageMock = () => {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => {
      return store.hasOwnProperty(key) ? store[key] : null
    },
    setItem: (key: string, value: string): void => {
      store[key] = value
    },
    removeItem: (key: string): void => {
      delete store[key]
    },
    clear: (): void => {
      Object.keys(store).forEach((key) => delete store[key])
    },
  }
}

// @ts-expect-error - global localStorage
global.localStorage = createLocalStorageMock()

// Mock console methods
beforeEach(() => {
  // @ts-expect-error - vi.fn in test context
  console.log = vi.fn()
  // @ts-expect-error - vi.fn in test context
  console.error = vi.fn()
  // @ts-expect-error - vi.fn in test context
  console.warn = vi.fn()
})
