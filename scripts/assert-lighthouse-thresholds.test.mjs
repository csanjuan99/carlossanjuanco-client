import { describe, expect, it } from 'vitest'
import { evaluateLighthouseReport } from './assert-lighthouse-thresholds.mjs'

const THRESHOLDS = {
  performance: 95,
  accessibility: 100,
  'best-practices': 100,
  seo: 100,
  lcpMs: 2500,
}

function buildReport({ performance = 100, accessibility = 100, bestPractices = 100, seo = 100, lcpMs = 1000 }) {
  return {
    categories: {
      performance: { score: performance / 100 },
      accessibility: { score: accessibility / 100 },
      'best-practices': { score: bestPractices / 100 },
      seo: { score: seo / 100 },
    },
    audits: {
      'largest-contentful-paint': { numericValue: lcpMs },
    },
  }
}

describe('evaluateLighthouseReport', () => {
  it('passes when all categories meet thresholds and LCP is under budget', () => {
    const report = buildReport({ performance: 97, lcpMs: 1800 })

    const result = evaluateLighthouseReport(report, THRESHOLDS)

    expect(result.pass).toBe(true)
    expect(result.failures).toEqual([])
  })

  it('fails and reports each category that misses its threshold, including LCP over budget', () => {
    const report = buildReport({ performance: 80, accessibility: 90, lcpMs: 3200 })

    const result = evaluateLighthouseReport(report, THRESHOLDS)

    expect(result.pass).toBe(false)
    expect(result.failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('performance'),
        expect.stringContaining('accessibility'),
        expect.stringContaining('lcp'),
      ]),
    )
    expect(result.failures).toHaveLength(3)
  })
})
