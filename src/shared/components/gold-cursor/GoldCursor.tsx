import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

function isFinePointerWithoutReducedMotion(): boolean {
  const finePointer = window.matchMedia('(pointer: fine)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return finePointer && !reducedMotion
}

const HOVER_TARGET_SELECTOR = 'a, [data-cursor-hover]'

export default function GoldCursor() {
  const [enabled] = useState(isFinePointerWithoutReducedMotion)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.4 })
  const springScale = useSpring(scale, { stiffness: 300, damping: 30, mass: 0.4 })

  useEffect(() => {
    if (!enabled) return

    function handleMove(event: MouseEvent) {
      x.set(event.clientX)
      y.set(event.clientY)
    }

    function handleOver(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest(HOVER_TARGET_SELECTOR) : null
      scale.set(target ? 2.2 : 1)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseover', handleOver)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseover', handleOver)
    }
  }, [enabled, x, y, scale])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 16,
        height: 16,
        marginTop: -8,
        marginLeft: -8,
        borderRadius: '50% 42% 55% 45%',
        background: 'radial-gradient(circle at 35% 35%, #e8cf98, #d4af6a 60%, #b8853f)',
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        zIndex: 80,
        x: springX,
        y: springY,
        scale: springScale,
      }}
    />
  )
}
