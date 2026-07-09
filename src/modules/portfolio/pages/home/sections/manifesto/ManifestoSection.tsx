import { useTranslation } from 'react-i18next'
import FadeIn from '@/shared/components/fade-in/FadeIn'
import RevealText from '@/shared/components/reveal-text/RevealText'

export default function ManifestoSection() {
  const { t } = useTranslation()

  return (
    <section className="flex justify-center px-6 py-[16vh]">
      <FadeIn
        as="div"
        y={56}
        duration={1.2}
        className="w-full max-w-[820px] rounded-sm bg-parchment p-10 shadow-2xl md:p-[88px]"
      >
        <div className="mb-7 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('manifesto.label')}</div>
        <RevealText
          as="p"
          text={t('manifesto.quote')}
          className="font-fraunces text-[clamp(24px,3.4vw,40px)] font-medium leading-[1.32]"
        />
        <div className="mt-9 font-mono text-[11px] tracking-[0.22em] text-ink/55">{t('manifesto.technique')}</div>
      </FadeIn>
    </section>
  )
}
