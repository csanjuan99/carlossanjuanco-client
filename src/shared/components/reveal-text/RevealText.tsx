import { Fragment } from 'react'
import { motion } from 'framer-motion'

interface RevealTextProps {
  text: string
  className?: string
  wordClassName?: string
  staggerDelay?: number
  as?: 'p' | 'h1' | 'h2' | 'span'
}

// eslint-disable-next-line react-refresh/only-export-components -- pure helper, exported for unit testing
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
        key={text}
        style={{ display: 'inline' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={containerVariants}
        custom={staggerDelay}
      >
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <span
              className={wordClassName}
              style={{
                display: 'inline-block',
                overflow: 'hidden',
                verticalAlign: 'top',
                // The mask must clip vertically (that is the slide-up reveal) but not
                // horizontally: italic Fraunces overshoots its advance width, so a flush
                // box shears the terminal of letters like "f". Padding widens the clip
                // box, the negative margin keeps the word's layout position unchanged.
                paddingInline: '0.12em',
                marginInline: '-0.12em',
              }}
            >
              <motion.span style={{ display: 'inline-block' }} variants={wordVariants}>
                {word}
              </motion.span>
            </span>
            {index < words.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  )
}
