import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_OUT_DIR = path.resolve(__dirname, '../src/shared/content/snapshot')

// endpoint -> [SiteContent key, extra query params]
const ENDPOINTS = {
  hero: ['hero', { populate: '*' }],
  manifesto: ['manifesto', {}],
  'stack-section': ['stackSection', {}],
  'obras-section': ['obrasSection', {}],
  'frieze-section': ['friezeSection', {}],
  'testimonials-section': ['testimonialsSection', {}],
  contact: ['contact', {}],
  'site-setting': ['siteSetting', {}],
  projects: ['projects', { populate: '*', sort: 'order' }],
  experiences: ['experiences', { sort: 'order' }],
  testimonials: ['testimonials', { sort: 'order' }],
  'stack-groups': ['stackGroups', { populate: '*', sort: 'order' }],
}

export async function fetchLocaleContent(locale, { strapiUrl, fetchImpl }) {
  const entries = await Promise.all(
    Object.entries(ENDPOINTS).map(async ([endpoint, [key, extraParams]]) => {
      const params = new URLSearchParams({ locale, ...extraParams })
      const response = await fetchImpl(`${strapiUrl}/api/${endpoint}?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Strapi request failed: ${endpoint} (${response.status})`)
      }
      const json = await response.json()
      return [key, json.data]
    }),
  )
  return Object.fromEntries(entries)
}

export async function run({
  locales = ['es', 'en'],
  strapiUrl = process.env.VITE_STRAPI_URL ?? process.env.STRAPI_URL ?? 'http://localhost:1337',
  fetchImpl = fetch,
  outDir = DEFAULT_OUT_DIR,
  fileExists = existsSync,
  readFile = (filePath) => readFileSync(filePath, 'utf-8'),
  writeFile = (filePath, content) => writeFileSync(filePath, content),
  ensureDir = (dir) => mkdirSync(dir, { recursive: true }),
  log = console.log,
  warn = console.warn,
} = {}) {
  ensureDir(outDir)
  let hadFailureWithoutSnapshot = false

  for (const locale of locales) {
    const filePath = path.join(outDir, `${locale}.json`)
    try {
      const content = await fetchLocaleContent(locale, { strapiUrl, fetchImpl })
      writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`)
      log(`[snapshot] wrote ${locale}.json`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (fileExists(filePath)) {
        readFile(filePath)
        warn(`[snapshot] WARNING: failed to refresh "${locale}" snapshot (${message}); reusing committed snapshot`)
      } else {
        warn(`[snapshot] ERROR: failed to fetch "${locale}" snapshot and no committed snapshot exists (${message})`)
        hadFailureWithoutSnapshot = true
      }
    }
  }

  return hadFailureWithoutSnapshot ? 1 : 0
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const exitCode = await run()
  process.exit(exitCode)
}
