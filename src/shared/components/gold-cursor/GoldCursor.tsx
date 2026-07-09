import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function GoldCursor() {
  const [enabled, setEnabled] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.4 })

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reducedMotion) return

    setEnabled(true)

    function handleMove(event: MouseEvent) {
      x.set(event.clientX)
      y.set(event.clientY)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [x, y])

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
      }}
    />
  )
}
