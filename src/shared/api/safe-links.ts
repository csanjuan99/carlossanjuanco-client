const SAFE_PROTOCOLS = new Set(['http:', 'https:'])

// Blocks mailto header injection: a CMS-controlled address containing
// ?subject= / &cc= / &bcc= would otherwise become extra mailto params.
// Loosening this regex (e.g. to allow ? or &) reopens that hole.
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

// Absolute http(s) only — rejects javascript:/data:/vbscript: schemes.
// Relative and protocol-relative URLs fail the URL parse and fall through
// to '#' on purpose: CMS links are always absolute.
export function safeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return SAFE_PROTOCOLS.has(parsed.protocol) ? url : '#'
  } catch {
    return '#'
  }
}

export function safeMailto(email: string): string {
  return EMAIL_PATTERN.test(email) ? `mailto:${email}` : '#'
}
