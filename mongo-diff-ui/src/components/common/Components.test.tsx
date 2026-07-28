import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Test Setup', () => {
  it('should have vitest globals', () => {
    expect(vi).toBeDefined()
    expect(beforeEach).toBeDefined()
  })
})
