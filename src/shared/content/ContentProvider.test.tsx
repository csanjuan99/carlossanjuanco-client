import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContentProvider, LANGUAGE_STORAGE_KEY, getInitialLocale, useContent } from './ContentProvider'
import type { SiteContent } from '@/shared/api/content.types'

function buildSiteContent(heroEyebrow: string): SiteContent {
  return {
    hero: {
      eyebrow: heroEyebrow,
      titleBefore: 'Before',
      titleEmphasis: 'Emphasis',
      subtitle: 'Subtitle',
      imageAlt: 'Alt',
      scrollHint: 'Scroll',
    },
    manifesto: { label: '', quote: '', technique: '' },
    stackSection: { label: '', title: '' },
    obrasSection: {
      label: '',
      title: '',
      numeralPrefix: '',
      technique: '',
      role: '',
      year: '',
      result: '',
      cta: '',
      imagePlaceholder: '',
      plateLabel: '',
    },
    friezeSection: { label: '', title: '' },
    testimonialsSection: { label: '', title: '' },
    contact: { label: '', title: '', subtitle: '', cta: '', email: '' },
    siteSetting: {
      githubUrl: '',
      linkedinUrl: '',
      email: '',
      copyright: '',
      githubLabel: '',
      linkedinLabel: '',
      emailLabel: '',
    },
    projects: [],
    experiences: [],
    testimonials: [],
    stackGroups: [],
  }
}

// Only 'es' is seeded — 'en' intentionally has no snapshot, to exercise the
// no-snapshot fallback path.
vi.mock('./snapshot', () => ({
  contentSnapshot: { es: buildSiteContent('es-hero-eyebrow') },
}))

function HeroProbe() {
  const { content, status } = useContent()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="hero-eyebrow">{content.hero.eyebrow}</span>
    </div>
  )
}

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) }
}

function failedResponse(status = 500) {
  return { ok: false, status, json: () => Promise.resolve({}) }
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

  it('paints seeded hero content synchronously on mount with status ready, before any fetch resolves', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )

    render(
      <ContentProvider>
        <HeroProbe />
      </ContentProvider>,
    )

    expect(screen.getByTestId('status').textContent).toBe('ready')
    expect(screen.getByTestId('hero-eyebrow').textContent).toBe('es-hero-eyebrow')
  })

  it('replaces seeded content with live data once the background refetch succeeds (unconditional swap)', async () => {
    const liveContent = buildSiteContent('live-hero-eyebrow')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: liveContent.hero })))

    render(
      <ContentProvider>
        <HeroProbe />
      </ContentProvider>,
    )

    expect(screen.getByTestId('hero-eyebrow').textContent).toBe('es-hero-eyebrow')
    await waitFor(() => expect(screen.getByTestId('hero-eyebrow').textContent).toBe('live-hero-eyebrow'))
    expect(screen.getByTestId('status').textContent).toBe('ready')
  })

  it('keeps seeded content and stays ready when the background refetch fails (no error screen)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(failedResponse(500))
    vi.stubGlobal('fetch', fetchMock)

    render(
      <ContentProvider>
        <HeroProbe />
      </ContentProvider>,
    )

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(screen.getByTestId('hero-eyebrow').textContent).toBe('es-hero-eyebrow')
    expect(screen.getByTestId('status').textContent).toBe('ready')
    expect(screen.queryByText('RETRY')).toBeNull()
  })

  it('shows the error screen only when there is no snapshot for the locale and the fetch also fails', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(failedResponse(500)))

    render(
      <ContentProvider>
        <div>site content</div>
      </ContentProvider>,
    )

    expect(await screen.findByText('RETRY')).toBeTruthy()
    expect(screen.queryByText('site content')).toBeNull()
  })

  it('recovers via retry when a locale with no snapshot eventually fetches successfully', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en')
    let failing = true
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(failing ? failedResponse(500) : jsonResponse({ data: {} })),
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
