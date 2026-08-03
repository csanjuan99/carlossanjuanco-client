import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const CATEGORY_KEYS = ['performance', 'accessibility', 'best-practices', 'seo']

export function evaluateLighthouseReport(report, thresholds) {
  const failures = []

  for (const key of CATEGORY_KEYS) {
    const score = Math.round((report.categories[key]?.score ?? 0) * 100)
    const threshold = thresholds[key]
    if (score < threshold) {
      failures.push(`${key}: ${score} < required ${threshold}`)
    }
  }

  // LCP must be strictly under budget; equal to the budget still fails.
  const lcpMs = report.audits['largest-contentful-paint']?.numericValue ?? Infinity
  if (lcpMs >= thresholds.lcpMs) {
    failures.push(`lcp: ${Math.round(lcpMs)}ms, required < ${thresholds.lcpMs}ms`)
  }

  return { pass: failures.length === 0, failures }
}

const THRESHOLDS = {
  performance: 95,
  accessibility: 100,
  'best-practices': 100,
  seo: 100,
  lcpMs: 2500,
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const reportPath = process.argv[2]
  const report = JSON.parse(readFileSync(reportPath, 'utf-8'))
  const { pass, failures } = evaluateLighthouseReport(report, THRESHOLDS)

  const scores = CATEGORY_KEYS.map((key) => `${key}=${Math.round((report.categories[key]?.score ?? 0) * 100)}`).join(
    ' ',
  )
  const lcp = Math.round(report.audits['largest-contentful-paint']?.numericValue ?? 0)
  console.log(`[measure] scores: ${scores} lcp=${lcp}ms`)

  if (!pass) {
    console.error('[measure] FAILED thresholds:')
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log('[measure] all thresholds met')
}
