import { useContent } from '@/shared/content/ContentProvider'
import FadeIn from '@/shared/components/fade-in/FadeIn'

export default function TestimonialsSection() {
  const { content } = useContent()
  const { testimonialsSection, testimonials } = content

  return (
    <section className="mx-auto max-w-[1100px] px-6 py-[12vh]">
      <div className="mb-16 text-center">
        <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{testimonialsSection.label}</div>
        <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">
          {testimonialsSection.title}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {testimonials.map((testimonial) => (
          <FadeIn
            key={testimonial.documentId}
            as="figure"
            y={56}
            duration={1.2}
            className="m-0 rounded-sm bg-sky-panel p-10 shadow-xl"
          >
            <blockquote className="m-0 mb-6 font-fraunces text-xl font-medium leading-snug text-ink">
              "{testimonial.quote}"
            </blockquote>
            <figcaption className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60">
              {testimonial.author}
            </figcaption>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
