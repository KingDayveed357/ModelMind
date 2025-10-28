"use client"

import { Button } from "@/components/ui/button"
import { Play, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden hero-grid-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full matte-panel animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent neon-accent" />
            <span className="text-sm font-medium text-accent">AI-Powered Analysis</span>
          </div> */}

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-normal text-balance leading-tight animate-slide-up">
            Transform data into
            <br />
            <span className="text-primary">predictive insights</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl leading-relaxed animate-fade-in">
            Upload your datasets, train sophisticated regression models, and visualize predictions with a beautiful
            interface designed for data scientists and analysts.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Button size="lg" className="animate-slide-in w-full sm:w-auto neon-accent" asChild>
              <Link href="/sign-up">Start analyzing free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 animate-slide-in w-full sm:w-auto matte-panel bg-transparent"
              asChild
            >
              <Link href="#demo">
                <Play className="w-4 h-4" />
                View Demo
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-8 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-accent neon-accent" />
              <span>4 core ML models</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-accent neon-accent" />
              <span>Real-time training</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-accent neon-accent" />
              <span>Interactive visualizations</span>
            </div>
          </div>
        </div>

        <div id="demo" className="mt-16 md:mt-24">
          <div className="relative rounded-xl matte-panel-elevated overflow-hidden animate-slide-up">
            <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full matte-panel border-2 border-primary/30 flex items-center justify-center hover:scale-110 hover:neon-accent transition-all duration-300 cursor-pointer group">
                  <Play className="w-6 sm:w-8 h-6 sm:h-8 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Watch RegressLab in action</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
