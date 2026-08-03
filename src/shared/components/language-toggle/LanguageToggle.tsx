import { useContent } from '@/shared/content/ContentProvider'

export default function LanguageToggle() {
  const { locale, setLocale } = useContent()
  const nextLocale = locale === 'es' ? 'en' : 'es'

  function handleClick() {
    setLocale(nextLocale)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-11 w-11 items-center justify-center font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
      aria-label={`Switch language to ${nextLocale === 'en' ? 'English' : 'Español'}`}
    >
      {nextLocale.toUpperCase()}
    </button>
  )
}
