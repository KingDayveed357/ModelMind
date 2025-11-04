"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useState } from "react"

const tableOfContents = [
  { id: "getting-started", label: "Getting Started" },
  { id: "typical-workflow", label: "Typical Workflow" },
  { id: "datasets", label: "Datasets" },
  { id: "model-selection", label: "Model Selection" },
  { id: "training", label: "Training" },
  { id: "evaluation-metrics", label: "Evaluation Metrics" },
  { id: "predictions-and-deployment", label: "Predictions & Deployment" },
  { id: "authentication", label: "Authentication" },
  { id: "api-endpoints", label: "API Endpoints" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "model-catalog", label: "Model Catalog" },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">
            ModelMind
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Documentation</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 matte-panel rounded-lg p-4 md:p-6">
              <h3 className="font-semibold mb-4 text-sm">Table of Contents</h3>
              <nav className="space-y-1">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Getting Started */}
            <section id="getting-started" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Getting Started</h2>
              <p className="text-muted-foreground mb-4">
                ModelMind is a platform for training, evaluating, and deploying supervised learning models. This guide
                will walk you through the typical workflow.
              </p>
              <div className="matte-panel rounded-lg p-6 space-y-4">
                <h3 className="font-semibold">Quick Start Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Sign up or log in with Supabase authentication</li>
                  <li>Upload your CSV dataset</li>
                  <li>ModelMind auto-detects regression vs classification</li>
                  <li>Select and configure models</li>
                  <li>Train and evaluate results</li>
                  <li>Deploy and make predictions via REST API</li>
                </ol>
                <div className="pt-4">
                  <Link
                    href="/dashboard/upload"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    Go to Dashboard <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Typical Workflow */}
            <section id="typical-workflow" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Typical Workflow</h2>
              <p className="text-muted-foreground mb-4">
                A typical ModelMind workflow consists of six steps: authentication, data upload, task detection, model
                training, evaluation, and deployment.
              </p>
              <div className="space-y-3">
                <div className="matte-panel-elevated rounded-lg p-4">
                  <h4 className="font-semibold mb-2">1. Sign In (Supabase Auth)</h4>
                  <p className="text-sm text-muted-foreground">
                    Authenticate securely with your email and password or social login.
                  </p>
                </div>
                <div className="matte-panel-elevated rounded-lg p-4">
                  <h4 className="font-semibold mb-2">2. Upload Dataset (CSV to Supabase Storage)</h4>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or select a CSV file. We validate and preview data instantly.
                  </p>
                </div>
                <div className="matte-panel-elevated rounded-lg p-4">
                  <h4 className="font-semibold mb-2">3. Auto or Manual Model Selection</h4>
                  <p className="text-sm text-muted-foreground">
                    We detect regression vs classification and suggest strong baselines. You can override and select
                    custom models.
                  </p>
                </div>
                <div className="matte-panel-elevated rounded-lg p-4">
                  <h4 className="font-semibold mb-2">4. Train (scikit-learn/FLAML)</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure hyperparameters and train your models with automatic progress tracking.
                  </p>
                </div>
                <div className="matte-panel-elevated rounded-lg p-4">
                  <h4 className="font-semibold mb-2">5. Evaluate (Rich Metrics & Visualizations)</h4>
                  <p className="text-sm text-muted-foreground">
                    View R², RMSE, MAE for regression or Accuracy, F1, ROC/AUC for classification.
                  </p>
                </div>
                <div className="matte-panel-elevated rounded-lg p-4">
                  <h4 className="font-semibold mb-2">6. Deploy & Predict (REST API)</h4>
                  <p className="text-sm text-muted-foreground">
                    Persist models and hit prediction endpoints. Export results and share with your team.
                  </p>
                </div>
              </div>
            </section>

            {/* Datasets */}
            <section id="datasets" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Datasets</h2>
              <p className="text-muted-foreground mb-4">
                ModelMind accepts CSV files. Each row represents a sample and each column a feature.
              </p>
              <div className="matte-panel rounded-lg p-6 space-y-4 font-mono text-sm">
                <div>
                  <p className="text-muted-foreground mb-2">Example CSV format:</p>
                  <code className="block bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre">
                    {`feature1,feature2,target
1.5,2.3,10.2
2.1,3.4,15.5
3.0,4.2,20.1`}
                  </code>
                </div>
                <ul className="space-y-2 text-muted-foreground text-base">
                  <li>• First row should contain column headers</li>
                  <li>• Use comma, tab, or semicolon as delimiter</li>
                  <li>• Numeric and categorical features are supported</li>
                  <li>• Last column is treated as target by default</li>
                </ul>
              </div>
            </section>

            {/* Model Selection */}
            <section id="model-selection" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Model Selection</h2>
              <p className="text-muted-foreground mb-6">
                ModelMind detects your task type (regression or classification) automatically, but you can manually
                select any model.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="matte-panel-elevated rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Regression Models</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Linear Regression</li>
                    <li>Ridge Regression</li>
                    <li>Lasso Regression</li>
                    <li>Support Vector Regression (SVR)</li>
                    <li>Random Forest Regressor</li>
                    <li>Gradient Boosting Regressor</li>
                    <li>Decision Tree Regressor</li>
                    <li>KNN Regressor</li>
                  </ul>
                </div>
                <div className="matte-panel-elevated rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Classification Models</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Logistic Regression</li>
                    <li>Support Vector Classifier (SVC)</li>
                    <li>Random Forest Classifier</li>
                    <li>Gradient Boosting Classifier</li>
                    <li>Decision Tree Classifier</li>
                    <li>KNN Classifier</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Training */}
            <section id="training" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Training</h2>
              <p className="text-muted-foreground mb-4">
                Configure hyperparameters, set test size, and train your models. ModelMind uses scikit-learn for
                training and optionally FLAML for hyperparameter tuning.
              </p>
              <div className="matte-panel rounded-lg p-6 space-y-4 font-mono text-sm">
                <p className="text-muted-foreground mb-2">Key training parameters:</p>
                <code className="block bg-muted/50 p-3 rounded">
                  {`test_size: 0.2          # Train/test split ratio
random_state: 42        # Reproducibility
n_estimators: 100       # For ensemble models
max_depth: 10          # For tree-based models`}
                </code>
              </div>
              <p className="text-muted-foreground mt-4">
                Training progress is displayed in real-time. Models are persisted in Supabase Storage for future
                retrieval.
              </p>
            </section>

            {/* Evaluation Metrics */}
            <section id="evaluation-metrics" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Evaluation Metrics</h2>
              <p className="text-muted-foreground mb-6">
                ModelMind computes comprehensive metrics for both regression and classification tasks.
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Regression Metrics</h3>
                  <div className="space-y-3">
                    <div className="matte-panel rounded-lg p-4">
                      <p className="font-mono text-sm mb-1">R² Score</p>
                      <p className="text-sm text-muted-foreground">
                        Coefficient of determination (0-1). Higher is better.
                      </p>
                    </div>
                    <div className="matte-panel rounded-lg p-4">
                      <p className="font-mono text-sm mb-1">RMSE (Root Mean Squared Error)</p>
                      <p className="text-sm text-muted-foreground">
                        Average prediction error magnitude. Lower is better.
                      </p>
                    </div>
                    <div className="matte-panel rounded-lg p-4">
                      <p className="font-mono text-sm mb-1">MAE (Mean Absolute Error)</p>
                      <p className="text-sm text-muted-foreground">
                        Average absolute prediction error. Lower is better.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Classification Metrics</h3>
                  <div className="space-y-3">
                    <div className="matte-panel rounded-lg p-4">
                      <p className="font-mono text-sm mb-1">Accuracy</p>
                      <p className="text-sm text-muted-foreground">Percentage of correct predictions (0-1).</p>
                    </div>
                    <div className="matte-panel rounded-lg p-4">
                      <p className="font-mono text-sm mb-1">F1 Score</p>
                      <p className="text-sm text-muted-foreground">
                        Harmonic mean of precision and recall (0-1). Balanced metric.
                      </p>
                    </div>
                    <div className="matte-panel rounded-lg p-4">
                      <p className="font-mono text-sm mb-1">AUC (Area Under ROC Curve)</p>
                      <p className="text-sm text-muted-foreground">
                        Probability model quality (0-1). Higher is better.
                      </p>
                    </div>
                    <div className="matte-panel rounded-lg p-4">
                      <p className="font-mono text-sm mb-1">Confusion Matrix</p>
                      <p className="text-sm text-muted-foreground">
                        Detailed view of true/false positives and negatives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Predictions & Deployment */}
            <section id="predictions-and-deployment" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Predictions & Deployment</h2>
              <p className="text-muted-foreground mb-4">
                Deploy trained models and make predictions via REST API endpoints.
              </p>
              <div className="space-y-4">
                <div className="matte-panel rounded-lg p-6 font-mono text-sm space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-2">Make a prediction:</p>
                    <code className="block bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre">
                      {`curl -X POST https://api.modelmind.io/predict \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "your-model-id",
    "features": [1.5, 2.3, 3.1]
  }'`}
                    </code>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Response:</p>
                    <code className="block bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre">
                      {`{
  "prediction": 10.2,
  "confidence": 0.95,
  "model": "linear_regression"
}`}
                    </code>
                  </div>
                </div>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Authentication</h2>
              <p className="text-muted-foreground mb-4">
                ModelMind uses Supabase for secure authentication. Sign up with email/password or social login.
              </p>
              <div className="matte-panel rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Getting Your Auth Token</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                    <li>Sign in to ModelMind</li>
                    <li>Go to Settings &gt; API Tokens</li>
                    <li>Click "Generate New Token"</li>
                    <li>Copy and store securely (only shown once)</li>
                  </ol>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Include your token in the Authorization header:{" "}
                    <code className="bg-muted/50 px-2 py-1 rounded">Authorization: Bearer YOUR_TOKEN</code>
                  </p>
                </div>
              </div>
            </section>

            {/* API Endpoints */}
            <section id="api-endpoints" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">API Endpoints</h2>
              <div className="space-y-4">
                <div className="matte-panel rounded-lg p-6">
                  <p className="font-mono font-semibold mb-2">POST /api/upload</p>
                  <p className="text-sm text-muted-foreground mb-2">Upload a CSV file to Supabase Storage.</p>
                  <p className="text-sm text-muted-foreground">Returns: dataset_id, rows, columns</p>
                </div>
                <div className="matte-panel rounded-lg p-6">
                  <p className="font-mono font-semibold mb-2">POST /api/train</p>
                  <p className="text-sm text-muted-foreground mb-2">Train a model on uploaded dataset.</p>
                  <p className="text-sm text-muted-foreground">Returns: model_id, metrics, training_time</p>
                </div>
                <div className="matte-panel rounded-lg p-6">
                  <p className="font-mono font-semibold mb-2">POST /api/predict</p>
                  <p className="text-sm text-muted-foreground mb-2">Make a prediction using a trained model.</p>
                  <p className="text-sm text-muted-foreground">Returns: prediction, confidence</p>
                </div>
                <div className="matte-panel rounded-lg p-6">
                  <p className="font-mono font-semibold mb-2">GET /api/models</p>
                  <p className="text-sm text-muted-foreground mb-2">List all your trained models.</p>
                  <p className="text-sm text-muted-foreground">Returns: array of model metadata</p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Troubleshooting</h2>
              <div className="space-y-4">
                <div className="matte-panel rounded-lg p-6">
                  <h4 className="font-semibold mb-2">CSV Upload Fails</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure your CSV is properly formatted with headers. Check file size (max 100MB).
                  </p>
                </div>
                <div className="matte-panel rounded-lg p-6">
                  <h4 className="font-semibold mb-2">Training Takes Too Long</h4>
                  <p className="text-sm text-muted-foreground">
                    Try reducing dataset size or selecting faster models like Linear Regression.
                  </p>
                </div>
                <div className="matte-panel rounded-lg p-6">
                  <h4 className="font-semibold mb-2">Poor Model Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Try feature engineering, hyperparameter tuning, or ensemble methods.
                  </p>
                </div>
                <div className="matte-panel rounded-lg p-6">
                  <h4 className="font-semibold mb-2">Authentication Error</h4>
                  <p className="text-sm text-muted-foreground">
                    Clear cookies and log in again. Ensure your auth token hasn't expired.
                  </p>
                </div>
              </div>
            </section>

            {/* Model Catalog */}
            <section id="model-catalog" className="scroll-mt-20">
              <h2 className="text-3xl font-serif font-normal mb-4">Model Catalog</h2>
              <p className="text-muted-foreground mb-6">
                Complete list of models available in ModelMind, organized by task type.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Regression Models</h3>
                  <div className="space-y-2">
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">linear_regression</p>
                      <p className="text-sm text-muted-foreground">Linear Regression - Fast baseline</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">ridge</p>
                      <p className="text-sm text-muted-foreground">Ridge - L2 regularization</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">lasso</p>
                      <p className="text-sm text-muted-foreground">Lasso - Feature selection</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">svr</p>
                      <p className="text-sm text-muted-foreground">Support Vector Regression - Advanced</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">random_forest_regressor</p>
                      <p className="text-sm text-muted-foreground">Random Forest - Ensemble</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">gradient_boosting_regressor</p>
                      <p className="text-sm text-muted-foreground">Gradient Boosting - High accuracy</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">decision_tree_regressor</p>
                      <p className="text-sm text-muted-foreground">Decision Tree - Interpretable</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">knn_regressor</p>
                      <p className="text-sm text-muted-foreground">KNN - Local patterns</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Classification Models</h3>
                  <div className="space-y-2">
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">logistic_regression</p>
                      <p className="text-sm text-muted-foreground">Logistic Regression - Probabilistic</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">svc</p>
                      <p className="text-sm text-muted-foreground">Support Vector Classifier - Advanced</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">random_forest_classifier</p>
                      <p className="text-sm text-muted-foreground">Random Forest - Robust ensemble</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">gradient_boosting_classifier</p>
                      <p className="text-sm text-muted-foreground">Gradient Boosting - Sequential ensemble</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">decision_tree_classifier</p>
                      <p className="text-sm text-muted-foreground">Decision Tree - Interpretable</p>
                    </div>
                    <div className="matte-panel rounded p-3">
                      <p className="font-mono text-xs text-primary mb-1">knn_classifier</p>
                      <p className="text-sm text-muted-foreground">KNN - Flexible classifier</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Back to Top */}
            <div className="pt-12 border-t border-border">
              <Link
                href="/#models"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
              >
                ← Back to ModelMind
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
