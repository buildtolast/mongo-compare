import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'
import type { ComparisonResult } from '@/types/comparison'

const THEME_STORAGE_KEY = 'mongo-compare-theme'

const sampleComparisonResult: ComparisonResult = {
  timestamp: '2024-01-01T00:00:00.000Z',
  source_instance: 'mongodb://mongo:27017',
  target_instance: 'mongodb://mongo:27017',
  source_database: 'sourcedb',
  target_database: 'targetdb',
  total_before: 10,
  total_after: 10,
  created: { count: 0, samples: [] },
  deleted: { count: 0, samples: [] },
  updated: {
    count: 1,
    samples: [
      {
        identifier: '401',
        changes: [
          { path: 'name', old_value: 'User401', new_value: 'ExtraUser1', type: 'changed' },
        ],
      },
    ],
  },
}

function jsonResponse(data: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: async () => data,
  } as unknown as Response
}

interface MockFetchOptions {
  runComparisonResult?: ComparisonResult
}

function installMockFetch(options: MockFetchOptions = {}) {
  const mockFetch = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.includes('/api/get-databases')) {
      return jsonResponse({ success: true, databases: ['sourcedb', 'targetdb'] })
    }
    if (url.includes('/api/get-collections')) {
      return jsonResponse({ success: true, collections: ['users'] })
    }
    if (url.includes('/api/run-comparison')) {
      return jsonResponse({
        success: true,
        result: options.runComparisonResult ?? sampleComparisonResult,
      })
    }

    throw new Error(`Unhandled fetch call to ${url}`)
  })

  // @ts-expect-error - assigning mock to global fetch for tests
  global.fetch = mockFetch
  return mockFetch
}

async function connectSourceAndTarget() {
  fireEvent.click(screen.getByRole('button', { name: /connect source/i }))
  fireEvent.click(screen.getByRole('button', { name: /connect target/i }))

  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: /^connected$/i })).toHaveLength(2)
  })
}

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  describe('theme switching and persistence', () => {
    it('applies the selected theme to <html> and persists it to localStorage', () => {
      installMockFetch()
      render(<App />)

      fireEvent.click(screen.getByRole('button', { name: /warm amber/i }))

      expect(document.documentElement.getAttribute('data-theme')).toBe('warm')
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('warm')
    })

    it('restores a theme previously saved in localStorage on mount', () => {
      installMockFetch()
      localStorage.setItem(THEME_STORAGE_KEY, 'violet')

      render(<App />)

      expect(document.documentElement.getAttribute('data-theme')).toBe('violet')
    })
  })

  describe('query filters', () => {
    it('sends the parsed source filter in the run-comparison request body', async () => {
      const mockFetch = installMockFetch()
      render(<App />)

      await connectSourceAndTarget()

      fireEvent.change(screen.getByLabelText(/source filter/i), {
        target: { value: '{"status": "active"}' },
      })

      fireEvent.click(screen.getByRole('button', { name: /run comparison/i }))

      await waitFor(() => {
        expect(screen.getByText('COMPARISON RESULTS')).toBeInTheDocument()
      })

      const runComparisonCall = mockFetch.mock.calls.find(([input]) =>
        String(input).includes('/api/run-comparison')
      )
      expect(runComparisonCall).toBeDefined()

      const body = JSON.parse(runComparisonCall![1]?.body as string)
      expect(body.source_filter).toEqual({ status: 'active' })
    })

    it('shows an inline error and does not call run-comparison when filter JSON is invalid', async () => {
      const mockFetch = installMockFetch()
      render(<App />)

      await connectSourceAndTarget()

      fireEvent.change(screen.getByLabelText(/source filter/i), {
        target: { value: '{not valid json' },
      })

      fireEvent.click(screen.getByRole('button', { name: /run comparison/i }))

      expect(await screen.findByText(/source filter is not valid json/i)).toBeInTheDocument()

      const runComparisonCalls = mockFetch.mock.calls.filter(([input]) =>
        String(input).includes('/api/run-comparison')
      )
      expect(runComparisonCalls).toHaveLength(0)
    })
  })

  describe('results view', () => {
    it('renders field-level diff content when toggled to Side-by-side, without triggering a download', async () => {
      installMockFetch()
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click')
      render(<App />)

      await connectSourceAndTarget()
      fireEvent.click(screen.getByRole('button', { name: /run comparison/i }))

      await waitFor(() => {
        expect(screen.getByText('COMPARISON RESULTS')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /side-by-side/i }))

      expect(await screen.findByText('User401')).toBeInTheDocument()
      expect(screen.getByText('ExtraUser1')).toBeInTheDocument()
      expect(clickSpy).not.toHaveBeenCalled()

      clickSpy.mockRestore()
    })

    it('switches back to Summary when the Summary toggle is clicked, without losing the comparison result', async () => {
      installMockFetch()
      render(<App />)

      await connectSourceAndTarget()
      fireEvent.click(screen.getByRole('button', { name: /run comparison/i }))

      await waitFor(() => {
        expect(screen.getByText('COMPARISON RESULTS')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /side-by-side/i }))
      expect(await screen.findByText('Old Value')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /^summary$/i }))

      // Still showing the same result (no re-fetch, no Start Over), just the
      // other view: DiffGroups content is back, side-by-side content is gone.
      expect(screen.getByText('COMPARISON RESULTS')).toBeInTheDocument()
      expect(screen.queryByText('Old Value')).not.toBeInTheDocument()
      expect(screen.getByText(/UPDATED/)).toBeInTheDocument()
    })

    it('resets the results view back to Summary after Start Over and a new comparison', async () => {
      installMockFetch()
      render(<App />)

      await connectSourceAndTarget()
      fireEvent.click(screen.getByRole('button', { name: /run comparison/i }))

      await waitFor(() => {
        expect(screen.getByText('COMPARISON RESULTS')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /side-by-side/i }))
      expect(await screen.findByText('User401')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /start over/i }))

      await waitFor(() => {
        expect(screen.queryByText('COMPARISON RESULTS')).not.toBeInTheDocument()
      })

      await connectSourceAndTarget()
      fireEvent.click(screen.getByRole('button', { name: /run comparison/i }))

      await waitFor(() => {
        expect(screen.getByText('COMPARISON RESULTS')).toBeInTheDocument()
      })

      // Back in Summary view: DiffGroups content is shown, not the side-by-side diff
      // (the side-by-side view uniquely renders "Old Value"/"New Value" labels).
      expect(screen.queryByText('Old Value')).not.toBeInTheDocument()
      expect(screen.getByText(/UPDATED/)).toBeInTheDocument()
    })
  })
})
