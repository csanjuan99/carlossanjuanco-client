import { useContent } from '@/shared/content/ContentProvider'
import { safeMailto, safeUrl } from '@/shared/api/safe-links'

// min-h-11 / px-2 give these 11px labels a 44px touch target without changing how they read.
const FOOTER_LINK_CLASS =
  'inline-flex min-h-11 items-center px-2 font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold'

export default function Footer() {
  const { content } = useContent()
  const siteSetting = content.siteSetting

  return (
    <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-ink/15 px-6 py-7 md:px-16">
      <div className="font-mono text-[11px] tracking-[0.24em] text-ink/70">{siteSetting.copyright}</div>
      <div className="flex gap-5">
        <a
          href={safeUrl(siteSetting.githubUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className={FOOTER_LINK_CLASS}
        >
          {siteSetting.githubLabel}
        </a>
        <a
          href={safeUrl(siteSetting.linkedinUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className={FOOTER_LINK_CLASS}
        >
          {siteSetting.linkedinLabel}
        </a>
        <a href={safeMailto(siteSetting.email)} className={FOOTER_LINK_CLASS}>
          {siteSetting.emailLabel}
        </a>
      </div>
    </footer>
  )
}
