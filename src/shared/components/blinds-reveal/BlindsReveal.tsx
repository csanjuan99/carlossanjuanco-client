import { useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const SLAT_COUNT = 6

interface BlindsRevealProps {
  children: ReactNode
  className?: string
}

export default function BlindsReveal({ children, className }: BlindsRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const slats = containerRef.current?.querySelectorAll('[data-blind-slat]')
      if (!slats || slats.length === 0) return

      // once: true — this is a one-time "unveiling," not a scroll-scrubbed effect, so
      // scrolling back up and down again must not replay it or fight the reveal underneath.
      const scrollTrigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          // Shrinking from the top edge (transformOrigin: 'top') reads as a curtain
          // lifting away, rather than a plain fade, echoing the "unveiled fresco" panel.
          gsap.to(slats, {
            scaleY: 0,
            transformOrigin: 'top',
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.inOut',
          })
        },
      })

      return () => scrollTrigger.kill()
    },
    { dependencies: [prefersReducedMotion] },
  )

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {children}
      {!prefersReducedMotion && (
        <div className="pointer-events-none absolute inset-0 flex" aria-hidden="true">
          {Array.from({ length: SLAT_COUNT }).map((_, index) => (
            <div key={index} data-blind-slat className="h-full flex-1 bg-parchment" />
          ))}
        </div>
      )}
    </div>
  )
}
