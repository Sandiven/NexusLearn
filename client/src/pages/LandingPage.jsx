import { motion } from 'framer-motion'
import Navbar from '@components/layout/Navbar'
import Footer from '@components/layout/Footer'
import HeroSection from '@components/landing/HeroSection'
import FeaturesSection from '@components/landing/FeaturesSection'
import HowItWorks from '@components/landing/HowItWorks'
import LeaderboardPreview from '@components/landing/LeaderboardPreview'
import CTASection from '@components/landing/CTASection'

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0F0F14 0%, #12121A 50%, #0F0F14 100%)',
        overflowX: 'hidden',
      }}
    >
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <LeaderboardPreview />
        <CTASection />
      </main>
      <Footer />
    </motion.div>
  )
}
