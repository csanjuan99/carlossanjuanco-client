import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import HomePage from './index'

vi.mock('@/shared/components/fresco-dome/FrescoDome', () => ({
  default: () => <canvas data-testid="fresco-dome" />,
}))
vi.mock('@/shared/components/gold-cursor/GoldCursor', () => ({
  default: () => null,
}))
vi.mock('./sections/hero/HeroSection', () => ({ default: () => <div>hero</div> }))
vi.mock('./sections/manifesto/ManifestoSection', () => ({ default: () => <div>manifesto</div> }))
vi.mock('./sections/stack/StackSection', () => ({ default: () => <div>stack</div> }))
vi.mock('./sections/obras/ObrasSection', () => ({ default: () => <div>obras</div> }))
vi.mock('./sections/frieze/FriezeSection', () => ({ default: () => <div>frieze</div> }))
vi.mock('./sections/testimonials/TestimonialsSection', () => ({ default: () => <div>testimonials</div> }))
vi.mock('./sections/contact/ContactSection', () => ({ default: () => <div>contact</div> }))
vi.mock('./sections/footer/Footer', () => ({ default: () => <div>footer</div> }))

describe('HomePage', () => {
  it('wraps the section content in exactly one <main> landmark, with the decorative canvas as a sibling outside it', () => {
    const { container } = render(<HomePage />)

    const mains = container.querySelectorAll('main')
    expect(mains).toHaveLength(1)

    const main = mains[0]
    expect(main.querySelector('[data-testid="fresco-dome"]')).toBeNull()

    const canvas = container.querySelector('[data-testid="fresco-dome"]')
    expect(canvas).not.toBeNull()
    expect(main.contains(canvas)).toBe(false)

    expect(main.textContent).toContain('hero')
    expect(main.textContent).toContain('footer')
  })
})
