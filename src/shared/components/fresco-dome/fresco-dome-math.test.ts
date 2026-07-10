import { describe, expect, it } from 'vitest'
import {
  calculateFocalPointYPercent,
  calculateRayIntensity,
  calculateRayRotationDegrees,
  clampProgress,
} from './fresco-dome-math'

describe('clampProgress', () => {
  it('clamps values below 0 to 0', () => {
    expect(clampProgress(-0.5)).toBe(0)
  })

  it('clamps values above 1 to 1', () => {
    expect(clampProgress(1.5)).toBe(1)
  })

  it('passes through in-range values unchanged', () => {
    expect(clampProgress(0.4)).toBe(0.4)
  })
})

describe('calculateRayIntensity', () => {
  it('is the minimum opacity at progress 0', () => {
    expect(calculateRayIntensity(0)).toBeCloseTo(0.12)
  })

  it('is the maximum opacity at progress 1', () => {
    expect(calculateRayIntensity(1)).toBeCloseTo(0.55)
  })

  it('is proportional at the midpoint', () => {
    expect(calculateRayIntensity(0.5)).toBeCloseTo(0.335)
  })

  it('clamps out-of-range progress before mapping', () => {
    expect(calculateRayIntensity(2)).toBeCloseTo(0.55)
  })
})

describe('calculateFocalPointYPercent', () => {
  it('starts at 30% at progress 0', () => {
    expect(calculateFocalPointYPercent(0)).toBe(30)
  })

  it('ends at 85% at progress 1', () => {
    expect(calculateFocalPointYPercent(1)).toBe(85)
  })

  it('is proportional at the midpoint', () => {
    expect(calculateFocalPointYPercent(0.5)).toBeCloseTo(57.5)
  })
})

describe('calculateRayRotationDegrees', () => {
  it('is 0 degrees at elapsed time 0', () => {
    expect(calculateRayRotationDegrees(0, 120)).toBe(0)
  })

  it('is 180 degrees at half the revolution duration', () => {
    expect(calculateRayRotationDegrees(60, 120)).toBe(180)
  })

  it('wraps around past one full revolution', () => {
    expect(calculateRayRotationDegrees(150, 120)).toBe(90)
  })

  it('returns 0 for a non-positive revolution duration', () => {
    expect(calculateRayRotationDegrees(50, 0)).toBe(0)
  })
})
