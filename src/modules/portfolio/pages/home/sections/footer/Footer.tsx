import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-ink/15 px-6 py-7 md:px-16">
      <div className="font-mono text-[11px] tracking-[0.24em] text-ink/55">{t('footer.copyright')}</div>
      <div className="flex gap-7">
        <a
          href="https://github.com/your-username"
          className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          {t('footer.github')}
        </a>
        <a
          href="https://linkedin.com/in/your-username"
          className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          {t('footer.linkedin')}
        </a>
        <a
          href="mailto:hello@example.com"
          className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          {t('footer.email')}
        </a>
      </div>
    </footer>
  )
}
