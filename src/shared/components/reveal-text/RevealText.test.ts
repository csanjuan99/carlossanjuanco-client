import { describe, expect, it } from 'vitest'
import { splitIntoWords } from './RevealText'

describe('splitIntoWords', () => {
  it('splits on single spaces', () => {
    expect(splitIntoWords('acto de creación')).toEqual(['acto', 'de', 'creación'])
  })

  it('collapses repeated spaces without producing empty entries', () => {
    expect(splitIntoWords('hello   world')).toEqual(['hello', 'world'])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitIntoWords('')).toEqual([])
  })
})
