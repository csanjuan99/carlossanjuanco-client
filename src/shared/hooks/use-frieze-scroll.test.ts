import { describe, expect, it } from 'vitest'
import { calculateFriezeTranslateX } from './use-frieze-scroll'

describe('calculateFriezeTranslateX', () => {
  it('is 0 at the start of the scroll range', () => {
    expect(calculateFriezeTranslateX(0, 3000, 1200)).toBe(-0)
  })

  it('reaches the full negative track distance at the end of the range', () => {
    expect(calculateFriezeTranslateX(1, 3000, 1200)).toBe(-1800)
  })

  it('is proportional at the midpoint', () => {
    expect(calculateFriezeTranslateX(0.5, 3000, 1200)).toBe(-900)
  })

  it('clamps progress values outside [0, 1]', () => {
    expect(calculateFriezeTranslateX(1.5, 3000, 1200)).toBe(-1800)
    expect(calculateFriezeTranslateX(-0.5, 3000, 1200)).toBe(-0)
  })

  it('never produces a positive distance when the track is narrower than the viewport', () => {
    expect(calculateFriezeTranslateX(1, 800, 1200)).toBe(-0)
  })
})
