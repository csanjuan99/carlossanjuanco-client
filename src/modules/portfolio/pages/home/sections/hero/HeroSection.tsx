import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import RevealText from '@/shared/components/reveal-text/RevealText'
import LanguageToggle from '@/shared/components/language-toggle/LanguageToggle'

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative box-border flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-12">
      <div className="absolute right-6 top-4 z-10">
        <LanguageToggle />
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: '-16vw' }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-[2%] top-1/2 h-[22vh] w-[34vw] rounded-[62%_38%_55%_45%] blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(181,106,74,.34), rgba(181,106,74,0) 72%)' }}
      />
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: '16vw' }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute right-[2%] top-[44%] h-[22vh] w-[34vw] rounded-[45%_55%_38%_62%] blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(201,161,90,.38), rgba(201,161,90,0) 72%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mb-7 text-center font-mono text-xs uppercase tracking-[0.32em] text-sienna"
      >
        {t('hero.eyebrow')}
      </motion.div>

      <h1 className="max-w-[14ch] text-center font-fraunces text-[clamp(52px,9.5vw,148px)] font-medium leading-[0.98] tracking-tight">
        <RevealText as="span" text={t('hero.titleBefore')} className="inline" />{' '}
        <RevealText as="span" text={t('hero.titleEmphasis')} className="inline italic text-sienna" />
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mb-10 mt-8 max-w-[44ch] text-center text-[clamp(17px,1.6vw,21px)] leading-relaxed text-ink/70"
      >
        {t('hero.subtitle')}
      </motion.p>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.8 }}
        className="relative h-[min(38vh,340px)] w-[min(760px,88vw)] rounded-sm"
        style={{
          background: 'linear-gradient(120deg, rgba(212,175,106,.35), rgba(181,106,74,.25) 60%, rgba(212,175,106,.35))',
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.3em] text-ink/50"
      >
        {t('hero.scrollHint')}
      </motion.div>
    </section>
  )
}
