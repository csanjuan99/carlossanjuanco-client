import GoldCursor from '@/shared/components/gold-cursor/GoldCursor'
import HeroSection from './sections/hero/HeroSection'
import ManifestoSection from './sections/manifesto/ManifestoSection'
import StackSection from './sections/stack/StackSection'
import ObrasSection from './sections/obras/ObrasSection'
import FriezeSection from './sections/frieze/FriezeSection'
import TestimonialsSection from './sections/testimonials/TestimonialsSection'
import ContactSection from './sections/contact/ContactSection'
import Footer from './sections/footer/Footer'

export default function HomePage() {
  return (
    <div className="relative bg-sky-gradient font-newsreader text-ink">
      <GoldCursor />
      <HeroSection />
      <ManifestoSection />
      <StackSection />
      <ObrasSection />
      <FriezeSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
