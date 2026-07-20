import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useContent } from '@/shared/content/ContentProvider'
import { mediaUrl } from '@/shared/api/strapi'
import RevealText from '@/shared/components/reveal-text/RevealText'
import LanguageToggle from '@/shared/components/language-toggle/LanguageToggle'
import heroCreacion from '@/assets/hero-creacion.png'

interface CloudProps {
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
  speed: number
  className: string
  background: string
}

function Cloud({ scrollYProgress, speed, className, background }: CloudProps) {
  const y = useTransform(scrollYProgress, (progress) => `${progress * speed * 26}%`)

  return (
    <motion.div
      aria-hidden="true"
      style={{ y, background }}
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
    />
  )
}

const HERO_IMAGE_CLIP_PATH =
  'polygon(0% 6%, 18% 1%, 50% 4%, 82% 0%, 100% 7%, 99% 94%, 80% 100%, 48% 96%, 20% 100%, 1% 93%)'

export default function HeroSection() {
  const { content } = useContent()
  const hero = content.hero
  const heroImageSrc = mediaUrl(hero.image) ?? heroCreacion
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })

  return (
    <section
      ref={sectionRef}
      className="relative box-border flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-12"
    >
      <div className="absolute right-6 top-4 z-10">
        <LanguageToggle />
      </div>

      <Cloud
        scrollYProgress={scrollYProgress}
        speed={-1.6}
        className="left-[-12%] top-[-8%] h-[34vh] w-[60vw]"
        background="radial-gradient(ellipse at center, rgba(232,223,208,.85), rgba(232,223,208,0) 70%)"
      />
      <Cloud
        scrollYProgress={scrollYProgress}
        speed={-0.9}
        className="right-[-14%] top-[22%] h-[30vh] w-[52vw]"
        background="radial-gradient(ellipse at center, rgba(224,218,206,.7), rgba(224,218,206,0) 70%)"
      />
      <Cloud
        scrollYProgress={scrollYProgress}
        speed={-0.5}
        className="bottom-[-6%] left-[8%] h-[32vh] w-[70vw]"
        background="radial-gradient(ellipse at center, rgba(181,106,74,.16), rgba(181,106,74,0) 70%)"
      />
      <Cloud
        scrollYProgress={scrollYProgress}
        speed={-1.2}
        className="left-[-10%] top-[48%] h-[26vh] w-[44vw]"
        background="radial-gradient(ellipse at center, rgba(240,235,224,.6), rgba(240,235,224,0) 70%)"
      />

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
        {hero.eyebrow}
      </motion.div>

      <h1 className="max-w-[14ch] text-center font-fraunces text-[clamp(52px,9.5vw,148px)] font-medium leading-[0.98] tracking-tight">
        <RevealText as="span" text={hero.titleBefore} className="inline" />{' '}
        <RevealText as="span" text={hero.titleEmphasis} className="inline italic text-sienna" />
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mb-10 mt-8 max-w-[44ch] text-center text-[clamp(17px,1.6vw,21px)] leading-relaxed text-ink/70"
      >
        {hero.subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[min(760px,88vw)]"
      >
        <img
          src={heroImageSrc}
          alt={hero.imageAlt}
          draggable={false}
          className="pointer-events-none block h-[min(38vh,340px)] w-full select-none object-cover"
          style={{ clipPath: HERO_IMAGE_CLIP_PATH }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.3em] text-ink/50"
      >
        {hero.scrollHint}
      </motion.div>
    </section>
  )
}
