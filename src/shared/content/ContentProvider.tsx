import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchMany, fetchOne } from '@/shared/api/strapi'
import { contentSnapshot } from './snapshot'
import type {
  ContactContent,
  Experience,
  HeroContent,
  ManifestoContent,
  ObrasSectionContent,
  Project,
  SectionHeadingContent,
  SiteContent,
  SiteSettingContent,
  StackGroup,
  Testimonial,
} from '@/shared/api/content.types'

export type SupportedLocale = 'es' | 'en'

export const LANGUAGE_STORAGE_KEY = 'fresco-portfolio-lang'

export function getInitialLocale(): SupportedLocale {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return stored === 'en' ? 'en' : 'es'
}

export type ContentStatus = 'loading' | 'ready' | 'error'

interface ContentContextValue {
  content: SiteContent
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  status: ContentStatus
}

const ContentContext = createContext<ContentContextValue | null>(null)

function snapshotFor(locale: SupportedLocale): SiteContent | undefined {
  return (contentSnapshot as Partial<Record<SupportedLocale, SiteContent>>)[locale]
}

async function fetchSiteContent(locale: SupportedLocale): Promise<SiteContent> {
  const [
    hero,
    manifesto,
    stackSection,
    obrasSection,
    friezeSection,
    testimonialsSection,
    contact,
    siteSetting,
    projects,
    experiences,
    testimonials,
    stackGroups,
  ] = await Promise.all([
    fetchOne<HeroContent>('hero', { locale, populate: '*' }),
    fetchOne<ManifestoContent>('manifesto', { locale }),
    fetchOne<SectionHeadingContent>('stack-section', { locale }),
    fetchOne<ObrasSectionContent>('obras-section', { locale }),
    fetchOne<SectionHeadingContent>('frieze-section', { locale }),
    fetchOne<SectionHeadingContent>('testimonials-section', { locale }),
    fetchOne<ContactContent>('contact', { locale }),
    fetchOne<SiteSettingContent>('site-setting', { locale }),
    fetchMany<Project>('projects', { locale, populate: '*', sort: 'order' }),
    fetchMany<Experience>('experiences', { locale, sort: 'order' }),
    fetchMany<Testimonial>('testimonials', { locale, sort: 'order' }),
    fetchMany<StackGroup>('stack-groups', { locale, populate: '*', sort: 'order' }),
  ])

  return {
    hero,
    manifesto,
    stackSection,
    obrasSection,
    friezeSection,
    testimonialsSection,
    contact,
    siteSetting,
    projects,
    experiences,
    testimonials,
    stackGroups,
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>(getInitialLocale)
  const [content, setContent] = useState<SiteContent | null>(() => snapshotFor(locale) ?? null)
  const [status, setStatus] = useState<ContentStatus>(() => (snapshotFor(locale) ? 'ready' : 'loading'))
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
    document.documentElement.lang = locale

    let cancelled = false
    const seeded = snapshotFor(locale)
    if (seeded) {
      setContent(seeded)
      setStatus('ready')
    } else {
      setStatus('loading')
    }

    fetchSiteContent(locale)
      .then((siteContent) => {
        if (cancelled) return
        setContent(siteContent)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        if (!seeded) {
          setStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [locale, retryToken])

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-sky-gradient font-newsreader text-ink">
        <p className="text-lg text-ink/70">The content could not be loaded.</p>
        <button
          type="button"
          onClick={() => setRetryToken((token) => token + 1)}
          className="border-b border-gold pb-1 font-mono text-xs tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          RETRY
        </button>
      </div>
    )
  }

  if (!content) return null

  return (
    <ContentContext.Provider value={{ content, locale, setLocale, status }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): ContentContextValue {
  const value = useContext(ContentContext)
  if (!value) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return value
}
