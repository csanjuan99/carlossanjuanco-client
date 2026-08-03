import { describe, expect, it } from 'vitest'
import { safeMailto, safeUrl } from './safe-links'

describe('safeUrl', () => {
  it('passes through http URLs', () => {
    expect(safeUrl('http://example.com')).toBe('http://example.com')
  })

  it('passes through https URLs', () => {
    expect(safeUrl('https://github.com/user')).toBe('https://github.com/user')
  })

  it('rejects javascript: URLs', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('#')
  })

  it('rejects javascript: URLs with mixed case and whitespace', () => {
    expect(safeUrl(' JavaScript:alert(1)')).toBe('#')
  })

  it('rejects data: URLs', () => {
    expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBe('#')
  })

  it('rejects vbscript: URLs', () => {
    expect(safeUrl('vbscript:msgbox(1)')).toBe('#')
  })

  it('rejects relative URLs', () => {
    expect(safeUrl('/about')).toBe('#')
  })

  it('rejects garbage input', () => {
    expect(safeUrl('not a url at all')).toBe('#')
  })

  it('rejects empty string', () => {
    expect(safeUrl('')).toBe('#')
  })
})

describe('safeMailto', () => {
  it('returns a mailto link for a valid email', () => {
    expect(safeMailto('hello@carlossanjuan.co')).toBe('mailto:hello@carlossanjuan.co')
  })

  it('accepts emails with plus and dots in the local part', () => {
    expect(safeMailto('first.last+tag@example.com')).toBe('mailto:first.last+tag@example.com')
  })

  it('rejects emails with query parameters', () => {
    expect(safeMailto('a@b.com?subject=spam')).toBe('#')
  })

  it('rejects emails with ampersands', () => {
    expect(safeMailto('a@b.com&cc=victim@c.com')).toBe('#')
  })

  it('rejects emails with newlines', () => {
    expect(safeMailto('a@b.com\nBcc: victim@c.com')).toBe('#')
  })

  it('rejects emails with spaces', () => {
    expect(safeMailto('a b@c.com')).toBe('#')
  })

  it('rejects empty string', () => {
    expect(safeMailto('')).toBe('#')
  })

  it('rejects strings without an at sign', () => {
    expect(safeMailto('not-an-email')).toBe('#')
  })
})
