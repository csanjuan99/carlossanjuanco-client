import { beforeEach, describe, expect, it } from 'vitest'
import { getInitialLanguage, LANGUAGE_STORAGE_KEY } from './i18n'

describe('getInitialLanguage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns "es" when nothing is stored', () => {
    expect(getInitialLanguage()).toBe('es')
  })

  it('returns "en" when "en" is stored', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en')
    expect(getInitialLanguage()).toBe('en')
  })

  it('falls back to "es" for an unrecognized stored value', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr')
    expect(getInitialLanguage()).toBe('es')
  })
})
