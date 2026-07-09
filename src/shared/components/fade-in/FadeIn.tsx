import { motion } from 'framer-motion'
import type { ComponentType, ElementType, ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  x?: number
  y?: number
  as?: ElementType
  className?: string
}

// Module-level cache so motion components stay stable across renders.
const motionComponentCache = new Map<ElementType, ComponentType<Record<string, unknown>>>()

function getMotionComponent(as: ElementType): ComponentType<Record<string, unknown>> {
  const cached = motionComponentCache.get(as)
  if (cached) return cached
  const created = motion.create(as) as ComponentType<Record<string, unknown>>
  motionComponentCache.set(as, created)
  return created
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  as = 'div',
  className,
}: FadeInProps) {
  // Safe: getMotionComponent returns a module-cached component, so its
  // identity is stable across renders and state is never reset.
  const MotionComponent = getMotionComponent(as)

  return (
    // eslint-disable-next-line react-hooks/static-components
    <MotionComponent
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </MotionComponent>
  )
}
