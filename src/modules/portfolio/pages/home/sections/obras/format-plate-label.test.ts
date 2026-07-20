import { describe, expect, it } from 'vitest'
import { formatPlateLabel } from './format-plate-label'

describe('formatPlateLabel', () => {
  it('replaces both numeral and year placeholders', () => {
    expect(formatPlateLabel('PLATE {{numeral}} — {{year}}', 'IV', '2024')).toBe(
      'PLATE IV — 2024',
    )
  })

  it('leaves the template intact when a placeholder is missing', () => {
    expect(formatPlateLabel('PLATE {{numeral}}', 'IV', '2024')).toBe('PLATE IV')
    expect(formatPlateLabel('YEAR {{year}}', 'IV', '2024')).toBe('YEAR 2024')
    expect(formatPlateLabel('NO PLACEHOLDERS', 'IV', '2024')).toBe('NO PLACEHOLDERS')
  })
})
