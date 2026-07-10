import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { STACK_GROUPS } from '../../data/stack-groups.data'

export default function StackSection() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-[1180px] px-6 py-[10vh] pb-[14vh]">
      <div className="mb-16 text-center">
        <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('stack.label')}</div>
        <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{t('stack.title')}</h2>
      </div>

      {STACK_GROUPS.map((group) => (
        <div key={group.name} className="mb-14">
          <div className="mb-6 flex items-center gap-4">
            <div className="whitespace-nowrap font-mono text-[11px] tracking-[0.3em] text-sienna">{group.name}</div>
            <div className="h-px flex-1 bg-gradient-to-r from-sienna/35 to-transparent" />
          </div>
          <div className="flex flex-wrap gap-5">
            {group.items.map((tool) => (
              <motion.div
                key={tool}
                initial={{ opacity: 0, scale: 0.82, y: 26 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative flex h-[118px] w-[118px] items-center justify-center overflow-hidden rounded-full shadow-lg"
                style={{
                  background: 'radial-gradient(circle at 38% 32%, #f0e8d8, #e2d5ba 55%, #cbb287)',
                  boxShadow:
                    'inset 0 0 0 1px rgba(212,175,106,.9), inset 0 0 0 5px rgba(232,223,208,.9), inset 0 0 0 6px rgba(143,74,46,.35)',
                }}
              >
                <span className="px-2.5 text-center font-fraunces text-sm font-semibold leading-tight text-sienna">
                  {tool}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
