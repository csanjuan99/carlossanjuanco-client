import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useContent } from '@/shared/content/ContentProvider'
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion'
import { safeMailto } from '@/shared/api/safe-links'

const HALO_BACKGROUND =
  'radial-gradient(circle, rgba(212,175,106,.5), rgba(212,175,106,.14) 42%, rgba(212,175,106,0) 68%)'
const SEAL_BACKGROUND =
  'radial-gradient(circle at 36% 30%, #e8cf98, #d4af6a 48%, #a97f3e 82%, #8f4a2e)'

export default function ContactSection() {
  const { content } = useContent()
  const contact = content.contact
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // The seal is the last thing the visitor sees and the moment they decide to write.
  // Scrubbing the halo across the section's approach makes the light gather as they
  // descend; the dome's rays already intensify with page progress, so this finishes
  // that arc instead of starting a separate one.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'center center'] })
  const haloScale = useTransform(scrollYProgress, [0, 1], [0.5, 1.06])
  const haloOpacity = useTransform(scrollYProgress, [0, 0.85], [0.03, 0.62])
  const sealScale = useTransform(scrollYProgress, [0.3, 1], [0.88, 1])

  return (
    <section
      ref={sectionRef}
      className="relative box-border flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 py-[14vh] text-center"
    >
      <motion.div
        aria-hidden="true"
        style={
          prefersReducedMotion
            ? { opacity: 0.6, background: HALO_BACKGROUND }
            : { scale: haloScale, opacity: haloOpacity, background: HALO_BACKGROUND }
        }
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />
      <div className="relative">
        <div className="mb-6 font-mono text-[11px] tracking-[0.34em] text-sienna">{contact.label}</div>
        <h2 className="mx-auto mb-5 max-w-[16ch] font-fraunces text-[clamp(40px,6vw,84px)] font-medium tracking-tight">
          {contact.title}
        </h2>
        <p className="mx-auto mb-14 max-w-[44ch] text-lg leading-relaxed text-ink/70">{contact.subtitle}</p>
        <motion.a
          href={safeMailto(contact.email)}
          style={
            prefersReducedMotion
              ? { background: SEAL_BACKGROUND }
              : { scale: sealScale, background: SEAL_BACKGROUND }
          }
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex h-[158px] w-[158px] items-center justify-center rounded-full font-mono text-xs tracking-[0.3em] text-[#3d2413] shadow-2xl"
        >
          {contact.cta}
        </motion.a>
      </div>
    </section>
  )
}
