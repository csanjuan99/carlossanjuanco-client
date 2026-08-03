import { describe, expect, it } from 'vitest'
import { contentSnapshot } from './index'

const SITE_CONTENT_KEYS = [
  'hero',
  'manifesto',
  'stackSection',
  'obrasSection',
  'friezeSection',
  'testimonialsSection',
  'contact',
  'siteSetting',
  'projects',
  'experiences',
  'testimonials',
  'stackGroups',
] as const

const HERO_KEYS = ['eyebrow', 'titleBefore', 'titleEmphasis', 'subtitle', 'imageAlt', 'scrollHint'] as const

describe('contentSnapshot', () => {
  it.each(['es', 'en'] as const)('satisfies the SiteContent shape for locale "%s"', (locale) => {
    const content = contentSnapshot[locale]

    for (const key of SITE_CONTENT_KEYS) {
      expect(content).toHaveProperty(key)
    }

    for (const key of HERO_KEYS) {
      expect(typeof content.hero[key]).toBe('string')
    }

    expect(Array.isArray(content.projects)).toBe(true)
    expect(Array.isArray(content.experiences)).toBe(true)
    expect(Array.isArray(content.testimonials)).toBe(true)
    expect(Array.isArray(content.stackGroups)).toBe(true)
  })
})
