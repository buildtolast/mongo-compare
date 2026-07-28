// Mock types for test utilities
/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom/vitest" />

declare global {
  const vi: typeof import('vitest')
  const beforeEach: typeof import('vitest').beforeEach
}

export {}
