export const MODEL_REGISTRY = {
  regression: {
    linear_regression: {
      name: "Linear Regression",
      description: "Simple linear model for continuous predictions",
      icon: "TrendingUp",
    },
    ridge: {
      name: "Ridge Regression",
      description: "Linear regression with L2 regularization",
      icon: "TrendingUp",
    },
    lasso: {
      name: "Lasso Regression",
      description: "Linear regression with L1 regularization",
      icon: "TrendingUp",
    },
    svr: {
      name: "Support Vector Regression",
      description: "Non-linear regression using support vectors",
      icon: "TrendingUp",
    },
    random_forest: {
      name: "Random Forest",
      description: "Ensemble of decision trees for robust predictions",
      icon: "Trees",
    },
    gradient_boosting: {
      name: "Gradient Boosting",
      description: "Sequential ensemble learning method",
      icon: "TrendingUp",
    },
    decision_tree: {
      name: "Decision Tree",
      description: "Tree-based model for interpretable predictions",
      icon: "GitBranch",
    },
    knn: {
      name: "K-Nearest Neighbors",
      description: "Instance-based learning algorithm",
      icon: "Network",
    },
  },
  classification: {
    logistic_regression: {
      name: "Logistic Regression",
      description: "Linear model for binary/multiclass classification",
      icon: "BarChart3",
    },
    svc: {
      name: "Support Vector Classifier",
      description: "Non-linear classification using support vectors",
      icon: "BarChart3",
    },
    random_forest: {
      name: "Random Forest",
      description: "Ensemble of decision trees for classification",
      icon: "Trees",
    },
    gradient_boosting: {
      name: "Gradient Boosting",
      description: "Sequential ensemble for classification",
      icon: "BarChart3",
    },
    decision_tree: {
      name: "Decision Tree",
      description: "Tree-based classifier",
      icon: "GitBranch",
    },
    knn: {
      name: "K-Nearest Neighbors",
      description: "Instance-based classification",
      icon: "Network",
    },
  },
}

export type ProblemType = "regression" | "classification" | "auto"
export type ModelKey = keyof typeof MODEL_REGISTRY.regression | keyof typeof MODEL_REGISTRY.classification
