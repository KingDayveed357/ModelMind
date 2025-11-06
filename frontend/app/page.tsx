"use client"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturesGrid } from "@/components/features-grid"
import { ModelsShowcase } from "@/components/models-showcase"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { FeedbackWidget } from "@/components/coming-soon/feedback-widget"

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-background">
      <Header />
      <main className="w-full">
        <HeroSection />
        <HowItWorks />
        <FeaturesGrid />
        <ModelsShowcase />
        <CTASection />
        <FeedbackWidget />
      </main>
      <Footer />
    </div>
  )
}
