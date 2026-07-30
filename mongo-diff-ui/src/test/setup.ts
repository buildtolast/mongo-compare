// Test setup for Vitest
import { beforeEach, describe, it, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock localStorage for tests
const createLocalStorageMock = () => {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
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

// Mock Blob and URL.createObjectURL for jsdom environment
beforeEach(() => {
  class MockBlob implements Blob {
    #data: unknown[]
    #options: { type?: string }

    constructor(data: unknown[], options: { type?: string } = {}) {
      this.#data = data
      this.#options = options
    }

    async text(): Promise<string> {
      return this.#data.map((d) => String(d)).join('')
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
      const text = await this.text()
      return new TextEncoder().encode(text).buffer
    }

    get size(): number {
      return this.#data.reduce((acc: number, d) => acc + String(d).length, 0)
    }

    get type(): string {
      return this.#options.type || ''
    }

    slice(start?: number, end?: number): Blob {
      return new MockBlob(this.#data.slice(start, end), this.#options)
    }

      async bytes(): Promise<Uint8Array<ArrayBuffer>> {
      const text = await this.text()
      return new TextEncoder().encode(text) as Uint8Array<ArrayBuffer>
    }

    stream(): ReadableStream<Uint8Array<ArrayBuffer>> {
      const text = this.#data.map((d) => String(d)).join('')
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(text) as Uint8Array<ArrayBuffer>)
          controller.close()
        },
      })
    }
  }

  const createObjectURL = (blob: Blob): string => {
    return `blob:${blob.type}:${Math.random().toString(36).substring(2)}`
  }

  const revokeObjectURL = (_url: string): void => {
    // No-op for testing
  }

  // @ts-expect-error - global Blob and URL
  global.Blob = MockBlob
  // @ts-expect-error - global URL
  global.URL = {
    createObjectURL,
    revokeObjectURL,
  } as unknown as typeof URL
})

// Mock console methods
beforeEach(() => {
  // @ts-expect-error - vi.fn in test context
  console.log = vi.fn()
  // @ts-expect-error - vi.fn in test context
  console.error = vi.fn()
  // @ts-expect-error - vi.fn in test context
  console.warn = vi.fn()
})
