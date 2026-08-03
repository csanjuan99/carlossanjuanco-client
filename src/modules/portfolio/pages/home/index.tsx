import { lazy, Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import HeroSection from './sections/hero/HeroSection'

// Below-the-fold sections (and the decorative gsap-driven canvas/cursor) are not
// needed for the initial/LCP-critical paint, so they are code-split out of the
// main bundle and loaded once the browser is idle-ready, instead of being parsed
// and executed up front alongside the hero.
const FrescoDome = lazy(() => import('@/shared/components/fresco-dome/FrescoDome'))
const GoldCursor = lazy(() => import('@/shared/components/gold-cursor/GoldCursor'))
const ManifestoSection = lazy(() => import('./sections/manifesto/ManifestoSection'))
const StackSection = lazy(() => import('./sections/stack/StackSection'))
const ObrasSection = lazy(() => import('./sections/obras/ObrasSection'))
const FriezeSection = lazy(() => import('./sections/frieze/FriezeSection'))
const TestimonialsSection = lazy(() => import('./sections/testimonials/TestimonialsSection'))
const ContactSection = lazy(() => import('./sections/contact/ContactSection'))
const Footer = lazy(() => import('./sections/footer/Footer'))

export default function HomePage() {
  return (
    // reducedMotion="user" makes every framer-motion transform in the page respect the
    // OS setting, matching what FrescoDome and BlindsReveal already do via the hook.
    // Opacity still animates, so the reveals degrade to plain fades instead of vanishing.
    <MotionConfig reducedMotion="user">
      <div className="relative bg-sky-gradient font-newsreader text-ink">
        <Suspense fallback={null}>
          <FrescoDome />
          <GoldCursor />
        </Suspense>
        <main>
          <HeroSection />
          <Suspense fallback={null}>
            <ManifestoSection />
            <StackSection />
            <ObrasSection />
            <FriezeSection />
            <TestimonialsSection />
            <ContactSection />
            <Footer />
          </Suspense>
        </main>
      </div>
    </MotionConfig>
  )
}
