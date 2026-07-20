import { afterEach, describe, expect, it, vi } from 'vitest'
import { STRAPI_URL, fetchMany, fetchOne, mediaUrl } from './strapi'

function mockFetch(response: { ok: boolean; status?: number; body?: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: () => Promise.resolve(response.body),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('fetchOne', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('unwraps the Strapi data envelope', async () => {
    mockFetch({ ok: true, body: { data: { title: 'Fresco' } } })
    await expect(fetchOne<{ title: string }>('hero')).resolves.toEqual({ title: 'Fresco' })
  })

  it('throws when the response is not ok', async () => {
    mockFetch({ ok: false, status: 500 })
    await expect(fetchOne('hero')).rejects.toThrow('Strapi request failed: hero (500)')
  })
})

describe('fetchMany', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('unwraps the Strapi data envelope into an array', async () => {
    mockFetch({ ok: true, body: { data: [{ numeral: 'I' }, { numeral: 'II' }] } })
    await expect(fetchMany<{ numeral: string }>('projects')).resolves.toEqual([
      { numeral: 'I' },
      { numeral: 'II' },
    ])
  })

  it('throws when the response is not ok', async () => {
    mockFetch({ ok: false, status: 404 })
    await expect(fetchMany('projects')).rejects.toThrow('Strapi request failed: projects (404)')
  })
})

describe('mediaUrl', () => {
  it('prefixes relative urls with the Strapi base url', () => {
    expect(mediaUrl({ url: '/uploads/fresco.png' })).toBe(`${STRAPI_URL}/uploads/fresco.png`)
  })

  it('passes through absolute urls', () => {
    expect(mediaUrl({ url: 'https://cdn.example.com/fresco.png' })).toBe(
      'https://cdn.example.com/fresco.png',
    )
  })

  it('returns null for missing media', () => {
    expect(mediaUrl(null)).toBeNull()
    expect(mediaUrl(undefined)).toBeNull()
  })
})
