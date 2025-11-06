import type { Metadata } from "next"
import { ComingSoonHero } from "@/components/coming-soon/hero-section"
import { ComingSoonFooter } from "@/components/coming-soon/footer-section"
import { FeedbackWidget } from "@/components/coming-soon/feedback-widget"

export const metadata: Metadata = {
  title: "Dashboard AI Assistant - Coming Soon | ModelMind",
  description:
    "Your data. Smarter decisions. Coming soon. An intelligent assistant built to supercharge your analytics workflow.",
}

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ComingSoonHero />
      <ComingSoonFooter />
      <FeedbackWidget />
    </div>
  )
}