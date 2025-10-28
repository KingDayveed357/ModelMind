"use client"

import { Upload, Brain, LineChart, MessageSquare, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Seamless Data Upload",
    description:
      "Drag and drop CSV files with instant validation and preview. Support for large datasets with smart parsing.",
  },
  {
    icon: Brain,
    title: "Core ML Models",
    description: "Choose from Linear, Multiple, Polynomial, and SVR regression models optimized for accuracy.",
  },
  {
    icon: LineChart,
    title: "Rich Visualizations",
    description: "Interactive charts showing predictions, residuals, and performance metrics with Recharts.",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Chat with an AI that understands your data and provides insights on model selection and results.",
  },
  {
    icon: Zap,
    title: "Real-time Training",
    description: "Watch your models train in real-time with progress indicators and performance updates.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data stays private. All processing happens securely with enterprise-grade encryption.",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 md:py-32 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full matte-panel animate-fade-in">
            <span className="text-xs font-medium text-accent">Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-balance animate-slide-up">
            Everything you need for regression analysis
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty animate-fade-in">
            Powerful tools designed with simplicity in mind. No complexity, just results.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-xl matte-panel-elevated hover:border-accent hover:scale-105 hover:neon-accent transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg matte-panel flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
