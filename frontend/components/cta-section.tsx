"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-16 md:py-24 lg:py-32 border-t border-border bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6 md:gap-8 p-8 md:p-12 rounded-2xl matte-panel-elevated animate-slide-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-balance">
            Ready to unlock your data's potential?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-pretty max-w-2xl">
            Join data scientists and analysts who trust RegressLab for sophisticated regression analysis. Start
            analyzing your data in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mt-2 md:mt-4 w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto animate-slide-in neon-accent" asChild>
              <Link href="/sign-up">
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto animate-slide-in matte-panel bg-transparent"
              asChild
            >
              <Link href="#contact">Talk to sales</Link>
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            No credit card required • Free tier available • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
