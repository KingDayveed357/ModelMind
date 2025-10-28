"use client"

import { Upload, Settings, TrendingUp, Download } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Data",
    description: "Import CSV files with your dataset. Our system validates and previews your data instantly.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure & Train",
    description: "Select from Linear, Multiple, Polynomial, or SVR models. Adjust parameters and start training.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Analyze Results",
    description: "View interactive visualizations, performance metrics, and predictions with detailed insights.",
  },
  {
    number: "04",
    icon: Download,
    title: "Export & Share",
    description: "Download your trained models, results, and reports. Share insights with your team.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32 matte-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full matte-panel animate-fade-in">
            <span className="text-xs font-medium text-primary">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-balance animate-slide-up">
            Four simple steps to insights
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty animate-fade-in">
            From data upload to actionable predictions in minutes, not hours.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-[2px] bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center gap-4 p-6 rounded-xl matte-panel-elevated hover:scale-105 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 rounded-xl matte-panel border-2 border-primary/20 flex items-center justify-center group-hover:border-accent group-hover:neon-accent transition-all">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-mono text-muted-foreground">{step.number}</div>
                  <h3 className="text-base sm:text-lg font-semibold">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
