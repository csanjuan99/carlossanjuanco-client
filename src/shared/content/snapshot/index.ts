import type { SiteContent } from '@/shared/api/content.types'
import type { SupportedLocale } from '../ContentProvider'
import es from './es.json'
import en from './en.json'

export const contentSnapshot: Record<SupportedLocale, SiteContent> = {
  es: es as unknown as SiteContent,
  en: en as unknown as SiteContent,
}
