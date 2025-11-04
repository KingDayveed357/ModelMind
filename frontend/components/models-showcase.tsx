"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const regressionModels = [
  {
    name: "Linear Regression",
    description: "Simple linear relationship between variables. Fast and interpretable.",
    key: "linear_regression",
    badge: "Fast",
  },
  {
    name: "Ridge Regression",
    description: "Linear with L2 regularization to prevent overfitting.",
    key: "ridge",
    badge: "Regularized",
  },
  {
    name: "Lasso Regression",
    description: "Linear with L1 regularization for feature selection.",
    key: "lasso",
    badge: "Feature Selection",
  },
  {
    name: "Support Vector Regression",
    description: "Advanced ML technique for complex non-linear relationships.",
    key: "svr",
    badge: "Advanced",
  },
  {
    name: "Random Forest Regressor",
    description: "Ensemble method combining multiple decision trees.",
    key: "random_forest_regressor",
    badge: "Ensemble",
  },
  {
    name: "Gradient Boosting Regressor",
    description: "Powerful ensemble technique for high accuracy predictions.",
    key: "gradient_boosting_regressor",
    badge: "High Accuracy",
  },
  {
    name: "Decision Tree Regressor",
    description: "Tree-based model for capturing non-linear patterns.",
    key: "decision_tree_regressor",
    badge: "Interpretable",
  },
  {
    name: "KNN Regressor",
    description: "Instance-based learning using nearest neighbors.",
    key: "knn_regressor",
    badge: "Local Patterns",
  },
]

const classificationModels = [
  {
    name: "Logistic Regression",
    description: "Probabilistic linear classifier for binary and multi-class.",
    key: "logistic_regression",
    badge: "Probabilistic",
  },
  {
    name: "Support Vector Classifier",
    description: "Powerful classifier using support vector machines.",
    key: "svc",
    badge: "Advanced",
  },
  {
    name: "Random Forest Classifier",
    description: "Ensemble of decision trees for robust classification.",
    key: "random_forest_classifier",
    badge: "Ensemble",
  },
  {
    name: "Gradient Boosting Classifier",
    description: "Sequential ensemble building for high accuracy.",
    key: "gradient_boosting_classifier",
    badge: "High Accuracy",
  },
  {
    name: "Decision Tree Classifier",
    description: "Tree-based model for interpretable classification.",
    key: "decision_tree_classifier",
    badge: "Interpretable",
  },
  {
    name: "KNN Classifier",
    description: "Instance-based learning for flexible classification.",
    key: "knn_classifier",
    badge: "Local Patterns",
  },
]

export function ModelsShowcase() {
  const [activeTab, setActiveTab] = useState<"regression" | "classification">("regression")

  const models = activeTab === "regression" ? regressionModels : classificationModels

  return (
    <section id="models" className="py-16 md:py-24 lg:py-32 matte-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full matte-panel animate-fade-in">
            <span className="text-xs font-medium text-primary">Models</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-balance animate-slide-up">
            16 Supervised Learning Models
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-pretty animate-fade-in">
            Compare and deploy regression and classification models from scikit-learn.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-12 md:mb-16">
          <button
            onClick={() => setActiveTab("regression")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "regression"
                ? "matte-panel-elevated text-foreground"
                : "matte-panel text-muted-foreground hover:text-foreground"
            }`}
          >
            Regression Models (8)
          </button>
          <button
            onClick={() => setActiveTab("classification")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "classification"
                ? "matte-panel-elevated text-foreground"
                : "matte-panel text-muted-foreground hover:text-foreground"
            }`}
          >
            Classification Models (8)
          </button>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {models.map((model, index) => (
            <div
              key={model.key}
              className="p-6 md:p-8 rounded-xl matte-panel-elevated hover:scale-105 hover:border-accent hover:neon-accent transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">{model.name}</h3>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {model.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-12 md:mt-16">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg matte-panel-elevated hover:border-accent hover:neon-accent transition-all duration-300 text-sm font-medium"
          >
            Compare Models in Dashboard
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
