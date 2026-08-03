import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import HeroSection from './HeroSection'

afterEach(cleanup)

vi.mock('@/shared/content/ContentProvider', () => ({
  useContent: () => ({
    content: {
      hero: {
        eyebrow: 'Eyebrow',
        titleBefore: 'Before',
        titleEmphasis: 'Emphasis',
        subtitle: 'Subtitle',
        imageAlt: 'Alt text',
        scrollHint: 'Scroll',
        image: { url: '/uploads/cms-hero.png' },
      },
    },
    locale: 'es',
    setLocale: vi.fn(),
    status: 'ready',
  }),
}))

describe('HeroSection', () => {
  it('renders a <picture> with a WebP source and a stable-path PNG fallback carrying explicit dimensions', () => {
    render(<HeroSection />)

    const picture = document.querySelector('picture')
    expect(picture).not.toBeNull()

    const source = picture?.querySelector('source[type="image/webp"]')
    expect(source).not.toBeNull()
    expect(source?.getAttribute('srcSet')).toBe('/hero-creacion.webp')

    const img = screen.getByAltText('Alt text')
    expect(img.getAttribute('src')).toBe('/hero-creacion.png')
    expect(img.getAttribute('width')).toBe('1520')
    expect(img.getAttribute('height')).toBe('680')
    expect(img.getAttribute('fetchpriority')).toBe('high')
  })

  it('does not gate the hero picture behind an initial-hidden mount animation state (LCP paint)', () => {
    render(<HeroSection />)

    const wrapper = screen.getByTestId('hero-image-wrapper')
    expect(wrapper.querySelector('picture')).not.toBeNull()
    expect(wrapper.getAttribute('style') ?? '').not.toContain('opacity: 0')
  })
})
