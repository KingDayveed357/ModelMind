"use client"

import { Badge } from "@/components/ui/badge"

const models = [
  {
    name: "Simple Linear Regression",
    description: "Perfect for understanding relationships between two variables",
    formula: "y = mx + b",
    useCase: "Sales forecasting, trend analysis",
  },
  {
    name: "Multiple Regression",
    description: "Analyze multiple independent variables simultaneously",
    formula: "y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ",
    useCase: "Price prediction, risk assessment",
  },
  {
    name: "Polynomial Regression",
    description: "Capture non-linear relationships in your data",
    formula: "y = β₀ + β₁x + β₂x² + ... + βₙxⁿ",
    useCase: "Growth curves, complex patterns",
  },
  {
    name: "Support Vector Regression",
    description: "Advanced ML technique for complex datasets",
    formula: "SVR with RBF kernel",
    useCase: "Stock prediction, anomaly detection",
  },
]

export function ModelsShowcase() {
  return (
    <section id="models" className="py-16 md:py-24 lg:py-32 matte-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full matte-panel animate-fade-in">
            <span className="text-xs font-medium text-primary">Models</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-balance animate-slide-up">
            Choose the right model for your data
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-pretty animate-fade-in">
            From simple linear to advanced SVR, we have the algorithms you need.
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {models.map((model, index) => (
            <div
              key={index}
              className="p-6 md:p-8 rounded-xl matte-panel-elevated hover:scale-105 hover:border-accent hover:neon-accent transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">{model.name}</h3>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    Available
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>
                <div className="p-3 md:p-4 rounded-lg matte-panel border border-border overflow-x-auto">
                  <code className="text-xs md:text-sm font-mono text-primary whitespace-nowrap">{model.formula}</code>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Use case:</span>
                  <span>{model.useCase}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
