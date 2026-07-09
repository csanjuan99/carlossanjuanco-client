import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const BRUSH_START =
  'polygon(8% 46%, 30% 42%, 52% 47%, 74% 43%, 92% 48%, 93% 55%, 70% 58%, 48% 54%, 26% 59%, 7% 54%)'
const BRUSH_END =
  'polygon(0% 2%, 22% 0%, 50% 2%, 78% 0%, 100% 3%, 100% 98%, 76% 100%, 50% 98%, 24% 100%, 0% 97%)'

interface BrushWipeImageProps {
  className?: string
  children: ReactNode
}

export default function BrushWipeImage({ className, children }: BrushWipeImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'start 40%'] })
  const clipPath = useTransform(scrollYProgress, [0, 1], [BRUSH_START, BRUSH_END])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div ref={ref} className={className} style={{ clipPath, opacity }}>
      {children}
    </motion.div>
  )
}
