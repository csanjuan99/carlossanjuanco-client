import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContentProvider, LANGUAGE_STORAGE_KEY, getInitialLocale } from './ContentProvider'

function mockFetchSuccess() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: {} }),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function mockFetchFailure() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: () => Promise.resolve({}),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('getInitialLocale', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it("returns 'es' when nothing is stored", () => {
    expect(getInitialLocale()).toBe('es')
  })

  it("returns 'en' when 'en' is stored", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en')
    expect(getInitialLocale()).toBe('en')
  })

  it("falls back to 'es' for unknown stored values", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'garbage')
    expect(getInitialLocale()).toBe('es')
  })
})

describe('ContentProvider', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('renders children after content loads successfully', async () => {
    mockFetchSuccess()
    render(
      <ContentProvider>
        <div>site content</div>
      </ContentProvider>,
    )
    expect(await screen.findByText('site content')).toBeTruthy()
  })

  it('renders the error state with a retry button when fetching fails', async () => {
    mockFetchFailure()
    render(
      <ContentProvider>
        <div>site content</div>
      </ContentProvider>,
    )
    expect(await screen.findByText('RETRY')).toBeTruthy()
    expect(screen.queryByText('site content')).toBeNull()
  })

  it('refetches and recovers after clicking retry', async () => {
    let failing = true
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: !failing,
        status: failing ? 500 : 200,
        json: () => Promise.resolve({ data: {} }),
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <ContentProvider>
        <div>site content</div>
      </ContentProvider>,
    )
    const retryButton = await screen.findByText('RETRY')

    failing = false
    fireEvent.click(retryButton)

    expect(await screen.findByText('site content')).toBeTruthy()
    await waitFor(() => expect(screen.queryByText('RETRY')).toBeNull())
  })
})
