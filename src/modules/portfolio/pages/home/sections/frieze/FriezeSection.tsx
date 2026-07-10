import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import BlindsReveal from '@/shared/components/blinds-reveal/BlindsReveal'
import { useFriezeScroll } from '@/shared/hooks/use-frieze-scroll'
import { FRIEZE_ENTRIES } from '../../data/frieze.data'
import type { FriezeEntryData } from '../../data/frieze.data'

export default function FriezeSection() {
  const { t } = useTranslation()
  const { containerRef, trackRef, x } = useFriezeScroll()

  return (
    <section className="py-[10vh]">
      <BlindsReveal className="mx-auto mb-14 max-w-[1180px] px-6">
        <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('frieze.label')}</div>
        <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{t('frieze.title')}</h2>
      </BlindsReveal>

      {/* Desktop: sticky-container horizontal scroll. Below md, this is replaced by a plain vertical stack — no scroll-jack on mobile. */}
      <div
        ref={containerRef}
        className="relative hidden md:block"
        style={{ height: `${FRIEZE_ENTRIES.length * 70}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div ref={trackRef} style={{ x }} className="flex gap-7 px-10">
            {FRIEZE_ENTRIES.map((entry) => (
              <FriezeCard key={entry.id} entry={entry} />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 md:hidden">
        {FRIEZE_ENTRIES.map((entry) => (
          <FriezeCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  )
}

function FriezeCard({ entry }: { entry: FriezeEntryData }) {
  const { t } = useTranslation()

  return (
    <div className="box-border w-[min(380px,82vw)] flex-none rounded-sm bg-parchment p-8 shadow-xl">
      <div className="mb-4 font-mono text-[11px] tracking-[0.26em] text-sienna">
        {t(`frieze.items.${entry.id}.years`)}
      </div>
      <div className="mb-1 font-fraunces text-2xl font-semibold">{t(`frieze.items.${entry.id}.company`)}</div>
      <div className="mb-4 font-fraunces text-base italic text-sienna">{t(`frieze.items.${entry.id}.role`)}</div>
      <p className="text-[15.5px] leading-relaxed text-ink/70">{t(`frieze.items.${entry.id}.feat`)}</p>
    </div>
  )
}
