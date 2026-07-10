import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPrefersReducedMotion } from './use-prefers-reduced-motion'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('getPrefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when the media query matches', () => {
    mockMatchMedia(true)
    expect(getPrefersReducedMotion()).toBe(true)
  })

  it('returns false when the media query does not match', () => {
    mockMatchMedia(false)
    expect(getPrefersReducedMotion()).toBe(false)
  })
})
