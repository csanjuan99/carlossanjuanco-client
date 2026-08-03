import { useRef } from 'react'
import type { RefObject } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'

export function calculateFriezeTranslateX(
  progress: number,
  trackWidth: number,
  viewportWidth: number,
): number {
  const distance = Math.max(trackWidth - viewportWidth, 0)
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  return -distance * clampedProgress
}

interface UseFriezeScrollResult {
  containerRef: RefObject<HTMLDivElement>
  trackRef: RefObject<HTMLDivElement>
  x: MotionValue<number>
}

export function useFriezeScroll(): UseFriezeScrollResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const x = useTransform(scrollYProgress, (progress) => {
    const track = trackRef.current
    const container = containerRef.current
    if (!track || !container) return 0
    return calculateFriezeTranslateX(progress, track.scrollWidth, container.clientWidth)
  })

  return {
    containerRef: containerRef as RefObject<HTMLDivElement>,
    trackRef: trackRef as RefObject<HTMLDivElement>,
    x,
  }
}
