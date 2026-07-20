import { useContent } from '@/shared/content/ContentProvider'

export default function Footer() {
  const { content } = useContent()
  const siteSetting = content.siteSetting

  return (
    <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-ink/15 px-6 py-7 md:px-16">
      <div className="font-mono text-[11px] tracking-[0.24em] text-ink/55">{siteSetting.copyright}</div>
      <div className="flex gap-7">
        <a
          href={siteSetting.githubUrl}
          className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          {siteSetting.githubLabel}
        </a>
        <a
          href={siteSetting.linkedinUrl}
          className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          {siteSetting.linkedinLabel}
        </a>
        <a
          href={`mailto:${siteSetting.email}`}
          className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          {siteSetting.emailLabel}
        </a>
      </div>
    </footer>
  )
}
