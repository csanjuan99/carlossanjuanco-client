import { motion } from 'framer-motion'
import { useContent } from '@/shared/content/ContentProvider'

export default function ContactSection() {
  const { content } = useContent()
  const contact = content.contact

  return (
    <section className="relative box-border flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 py-[14vh] text-center">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.1, scale: 0.6 }}
        whileInView={{ opacity: 0.6, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,106,.5), rgba(212,175,106,.14) 42%, rgba(212,175,106,0) 68%)',
        }}
      />
      <div className="relative">
        <div className="mb-6 font-mono text-[11px] tracking-[0.34em] text-sienna">{contact.label}</div>
        <h2 className="mx-auto mb-5 max-w-[16ch] font-fraunces text-[clamp(40px,6vw,84px)] font-medium tracking-tight">
          {contact.title}
        </h2>
        <p className="mx-auto mb-14 max-w-[44ch] text-lg leading-relaxed text-ink/70">{contact.subtitle}</p>
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex h-[158px] w-[158px] items-center justify-center rounded-full font-mono text-xs tracking-[0.3em] text-[#3d2413] shadow-2xl transition-transform duration-500 hover:scale-105"
          style={{ background: 'radial-gradient(circle at 36% 30%, #e8cf98, #d4af6a 48%, #a97f3e 82%, #8f4a2e)' }}
        >
          {contact.cta}
        </a>
      </div>
    </section>
  )
}
