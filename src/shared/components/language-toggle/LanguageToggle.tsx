import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const nextLanguage = i18n.language === 'es' ? 'en' : 'es'

  function handleClick() {
    i18n.changeLanguage(nextLanguage)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
      aria-label={`Switch language to ${nextLanguage === 'en' ? 'English' : 'Español'}`}
    >
      {nextLanguage.toUpperCase()}
    </button>
  )
}
