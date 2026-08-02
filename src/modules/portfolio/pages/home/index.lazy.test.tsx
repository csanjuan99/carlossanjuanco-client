import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'

// This spec proves the Suspense boundary actually defers rendering (rather than
// just trusting that `React.lazy` was used), by controlling exactly when the
// dynamically-imported Footer module resolves. `vi.hoisted` is required here
// (rather than a plain module-scope `let`) because `vi.mock` factories are
// hoisted above the rest of the file and must close over a hoisted binding.
const footerModuleControl = vi.hoisted(() => ({
  resolve: (_mod: { default: () => unknown }) => {},
  requested: false,
}))

vi.mock('@/shared/components/fresco-dome/FrescoDome', () => ({ default: () => null }))
vi.mock('@/shared/components/gold-cursor/GoldCursor', () => ({ default: () => null }))
vi.mock('./sections/hero/HeroSection', () => ({ default: () => <div>hero</div> }))
vi.mock('./sections/manifesto/ManifestoSection', () => ({ default: () => <div>manifesto</div> }))
vi.mock('./sections/stack/StackSection', () => ({ default: () => <div>stack</div> }))
vi.mock('./sections/obras/ObrasSection', () => ({ default: () => <div>obras</div> }))
vi.mock('./sections/frieze/FriezeSection', () => ({ default: () => <div>frieze</div> }))
vi.mock('./sections/testimonials/TestimonialsSection', () => ({ default: () => <div>testimonials</div> }))
vi.mock('./sections/contact/ContactSection', () => ({ default: () => <div>contact</div> }))
vi.mock(
  './sections/footer/Footer',
  () =>
    new Promise((resolve) => {
      footerModuleControl.resolve = resolve
      footerModuleControl.requested = true
    }),
)

describe('HomePage (lazy-loading timing)', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the hero immediately but withholds the below-the-fold Footer until its chunk resolves', async () => {
    const { default: HomePage } = await import('./index')
    const { container } = render(<HomePage />)

    expect(container.textContent).toContain('hero')
    expect(container.textContent).not.toContain('footer')

    // React defers invoking a below-the-fold lazy loader until after the initial
    // commit, not necessarily synchronously within render() — wait for the
    // Footer chunk to actually be requested before resolving it.
    await waitFor(() => expect(footerModuleControl.requested).toBe(true))
    footerModuleControl.resolve({ default: () => <div>footer</div> })

    await waitFor(() => expect(container.textContent).toContain('footer'))
  })
})
