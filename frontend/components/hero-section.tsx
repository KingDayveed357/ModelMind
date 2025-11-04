"use client"

import { Button } from "@/components/ui/button"
import { Play, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden hero-grid-bg ">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 ">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full matte-panel animate-fade-in-delayed-100">
            <Zap className="w-4 h-4 text-accent neon-accent" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Predictive Intelligence
            </span>
          </div> */}

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-normal text-balance leading-tight animate-fade-up-hero-delayed-300">
            Turn raw data into
            <br />
            <span className="text-accent">intelligent predictions</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl leading-relaxed animate-fade-in-delayed-500">
            Upload your data, we auto-detect task type, compare models, visualize metrics, and deploy
            {/* —powered by
            FastAPI, Next.js, and Supabase. */}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto justify-center">
            <Button
              size="lg"
              className="animate-slide-in-delayed-700 w-full sm:w-auto neon-accent hover:scale-105 transition-transform duration-300"
              asChild
            >
              <Link href="/dashboard">Launch Dashboard</Link>
            </Button>
            <Button
              size="lg"
              variant="default"
              className="gap-2 text-black dark:text-white  animate-slide-in-delayed-700 w-full sm:w-auto matte-panel bg-transparent hover:scale-75 transition-colors duration-300"
              asChild
            >
              <Link href="/docs#getting-started">
                <Play className="w-4 h-4" />
                Read the Guide
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-8 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2 animate-fade-in-delayed-700">
              <div className="w-2 h-2 rounded-full bg-accent neon-accent" />
              <span>16 supervised models</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in-delayed-800">
              <div className="w-2 h-2 rounded-full bg-accent neon-accent" />
              <span>Auto-detect task type</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in-delayed-900">
              <div className="w-2 h-2 rounded-full bg-accent neon-accent" />
              <span>Rich evaluation metrics</span>
            </div>
          </div>
        </div>

        {/* <div id="demo" className="mt-16 md:mt-24">
          <div className="relative rounded-xl matte-panel-elevated overflow-hidden animate-slide-up">
            <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center hover:from-primary/15 hover:via-accent/10 transition-all duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full matte-panel border-2 border-primary/30 flex items-center justify-center hover:scale-110 hover:neon-accent hover:border-accent transition-all duration-300 cursor-pointer group">
                  <Play className="w-6 sm:w-8 h-6 sm:h-8 text-primary group-hover:text-accent group-hover:scale-110 transition-all duration-300" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Watch ModelMind in action</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
}
