import { describe, expect, it, vi } from 'vitest'
import { run } from './snapshot-content.mjs'

function jsonResponse(body) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) }
}

function failedResponse(status = 500) {
  return { ok: false, status, json: () => Promise.resolve({}) }
}

describe('snapshot-content run()', () => {
  it('fetches all 12 endpoints for both locales and writes es/en snapshot files', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ data: { hello: 'world' } }))
    const writeFile = vi.fn()
    const fileExists = vi.fn().mockReturnValue(false)
    const ensureDir = vi.fn()

    const exitCode = await run({
      locales: ['es', 'en'],
      strapiUrl: 'http://localhost:1337',
      fetchImpl,
      writeFile,
      fileExists,
      ensureDir,
      log: vi.fn(),
      warn: vi.fn(),
      outDir: '/fake/out',
    })

    expect(exitCode).toBe(0)
    // 12 endpoints x 2 locales
    expect(fetchImpl).toHaveBeenCalledTimes(24)
    expect(writeFile).toHaveBeenCalledTimes(2)
    const writtenPaths = writeFile.mock.calls.map(([filePath]) => filePath)
    expect(writtenPaths).toEqual(
      expect.arrayContaining([expect.stringContaining('es.json'), expect.stringContaining('en.json')]),
    )
  })

  it('warns and reuses the committed snapshot on network failure when one already exists, exiting 0', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(failedResponse(500))
    const writeFile = vi.fn()
    const fileExists = vi.fn().mockReturnValue(true)
    const warn = vi.fn()

    const exitCode = await run({
      locales: ['es'],
      strapiUrl: 'http://localhost:1337',
      fetchImpl,
      writeFile,
      fileExists,
      ensureDir: vi.fn(),
      log: vi.fn(),
      warn,
      outDir: '/fake/out',
    })

    expect(exitCode).toBe(0)
    expect(writeFile).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('WARNING'))
  })

  it('exits non-zero on network failure when no committed snapshot exists for the locale', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(failedResponse(500))
    const writeFile = vi.fn()
    const fileExists = vi.fn().mockReturnValue(false)
    const warn = vi.fn()

    const exitCode = await run({
      locales: ['es'],
      strapiUrl: 'http://localhost:1337',
      fetchImpl,
      writeFile,
      fileExists,
      ensureDir: vi.fn(),
      log: vi.fn(),
      warn,
      outDir: '/fake/out',
    })

    expect(exitCode).toBe(1)
    expect(writeFile).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ERROR'))
  })
})
