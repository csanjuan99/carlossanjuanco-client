import { useContent } from '@/shared/content/ContentProvider'
import TestimonialPlate from './testimonial-plate/TestimonialPlate'

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

      {/* Perspective belongs to the group, not the card: both plates must share one
          vanishing point so they read as inscriptions on a single ceiling rather than
          as two independent flips. */}
      <div className="grid grid-cols-1 gap-8 [perspective:1400px] sm:grid-cols-2">
        {testimonials.map((testimonial, index) => (
          <TestimonialPlate key={testimonial.documentId} testimonial={testimonial} index={index} />
        ))}
      </div>
    </section>
  )
}
