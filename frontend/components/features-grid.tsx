"use client"

import { Upload, Brain, LineChart, MessageSquare, Zap, Shield } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Upload,
    title: "Automatic Task Detection",
    description: "Upload CSV, we auto-detect regression vs classification and suggest strong baseline models.",
    docLink: "#model-selection",
  },
  {
    icon: Brain,
    title: "Hyperparameter Tuning",
    description: "Manual tuning or automated with FLAML. Optimize every model to perfection.",
    docLink: "#training",
  },
  {
    icon: LineChart,
    title: "Rich Evaluation Metrics",
    description: "R², RMSE, MAE for regression. Accuracy, F1, ROC/AUC, Confusion Matrix for classification.",
    docLink: "#evaluation-metrics",
  },
  {
    icon: MessageSquare,
    title: "Model Management",
    description: "Save, load, deploy, and version your models. One-click REST API for predictions.",
    docLink: "#predictions-and-deployment",
  },
  {
    icon: Zap,
    title: "Secure Authentication",
    description: "Supabase-powered auth with session management. Your data stays private.",
    docLink: "#authentication",
  },
  {
    icon: Shield,
    title: "Real-time Updates",
    description: "Live training progress, instant metric updates, and Supabase subscriptions.",
    docLink: "#typical-workflow",
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
            Everything for supervised learning
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty animate-fade-in">
            Task-aware AutoML, rich evaluation, and seamless deployment—all in one platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={`/docs${feature.docLink}`}
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
