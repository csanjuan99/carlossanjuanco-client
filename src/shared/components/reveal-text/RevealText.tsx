import { motion } from 'framer-motion'

interface RevealTextProps {
  text: string
  className?: string
  wordClassName?: string
  staggerDelay?: number
  as?: 'p' | 'h1' | 'h2' | 'span'
}

export function splitIntoWords(text: string): string[] {
  return text.split(' ').filter((word) => word.length > 0)
}

const containerVariants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
}

const wordVariants = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

export default function RevealText({
  text,
  className,
  wordClassName,
  staggerDelay = 0.05,
  as: Tag = 'p',
}: RevealTextProps) {
  const words = splitIntoWords(text)

  return (
    <Tag className={className}>
      <motion.span
        style={{ display: 'inline' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={containerVariants}
        custom={staggerDelay}
      >
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={wordClassName}
            style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}
          >
            <motion.span style={{ display: 'inline-block' }} variants={wordVariants}>
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
