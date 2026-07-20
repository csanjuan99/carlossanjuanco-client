import { motion } from 'framer-motion'
import { useContent } from '@/shared/content/ContentProvider'
import BlindsReveal from '@/shared/components/blinds-reveal/BlindsReveal'
import { useFriezeScroll } from '@/shared/hooks/use-frieze-scroll'
import type { Experience } from '@/shared/api/content.types'

export default function FriezeSection() {
  const { content } = useContent()
  const { friezeSection, experiences } = content
  const { containerRef, trackRef, x } = useFriezeScroll()

  return (
    <section className="py-[10vh]">
      <BlindsReveal className="mx-auto mb-14 max-w-[1180px] px-6">
        <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{friezeSection.label}</div>
        <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{friezeSection.title}</h2>
      </BlindsReveal>

      {/* Desktop: sticky-container horizontal scroll. Below md, this is replaced by a plain vertical stack — no scroll-jack on mobile. */}
      <div
        ref={containerRef}
        className="relative hidden md:block"
        style={{ height: `${experiences.length * 70}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div ref={trackRef} style={{ x }} className="flex gap-7 px-10">
            {experiences.map((experience) => (
              <FriezeCard key={experience.documentId} experience={experience} />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 md:hidden">
        {experiences.map((experience) => (
          <FriezeCard key={experience.documentId} experience={experience} />
        ))}
      </div>
    </section>
  )
}

function FriezeCard({ experience }: { experience: Experience }) {
  return (
    <div className="box-border w-[min(380px,82vw)] flex-none rounded-sm bg-parchment p-8 shadow-xl">
      <div className="mb-4 font-mono text-[11px] tracking-[0.26em] text-sienna">{experience.years}</div>
      <div className="mb-1 font-fraunces text-2xl font-semibold">{experience.company}</div>
      <div className="mb-4 font-fraunces text-base italic text-sienna">{experience.role}</div>
      <p className="text-[15.5px] leading-relaxed text-ink/70">{experience.feat}</p>
    </div>
  )
}
