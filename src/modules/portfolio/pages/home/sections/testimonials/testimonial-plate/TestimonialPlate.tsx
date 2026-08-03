import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import RevealText from '@/shared/components/reveal-text/RevealText'
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion'
import type { Testimonial } from '@/shared/api/content.types'

const PLATE_CLASS = 'm-0 rounded-sm bg-sky-panel p-10 shadow-xl'
const QUOTE_CLASS = 'm-0 mb-6 font-fraunces text-xl font-medium leading-snug text-ink'
const AUTHOR_CLASS = 'font-mono text-[11px] uppercase tracking-[0.22em] text-ink/75'

interface TestimonialPlateProps {
  testimonial: Testimonial
  index: number
}

export default function TestimonialPlate({ testimonial, index }: TestimonialPlateProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Scrubbed rather than triggered. FadeIn fires once and finishes whether or not the
  // visitor is still moving; tying the rotation to scroll progress means the plate
  // turns under their own scroll, which is what makes it read as a reveal.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'start 42%'] })
  // The second plate lags a fifth of the range behind the first, so the pair lands as
  // a sequence instead of a single synchronized flip.
  const settle = useTransform(scrollYProgress, [index * 0.2, 1], [0, 1])
  const rotateX = useTransform(settle, [0, 1], [12, 0])
  const y = useTransform(settle, [0, 1], [76, 0])
  const opacity = useTransform(settle, [0, 0.5], [0, 1])

  const quote = `“${testimonial.quote}”`

  if (prefersReducedMotion) {
    return (
      <figure className={PLATE_CLASS}>
        <blockquote className={QUOTE_CLASS}>{quote}</blockquote>
        <figcaption className={AUTHOR_CLASS}>{testimonial.author}</figcaption>
      </figure>
    )
  }

  return (
    <motion.figure
      ref={ref}
      style={{ rotateX, y, opacity, transformOrigin: 'center top' }}
      className={PLATE_CLASS}
    >
      <blockquote className={QUOTE_CLASS}>
        <RevealText as="span" text={quote} />
      </blockquote>
      <figcaption className={AUTHOR_CLASS}>{testimonial.author}</figcaption>
    </motion.figure>
  )
}
