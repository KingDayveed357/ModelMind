// components/analytics/ClassificationAnalytics.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, AlertCircle, Target, Activity, Info, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from "@/lib/utils"
import { modelService, ClassificationAnalytics as ClassificationAnalyticsType } from '@/lib/services/model-service'
import { toast } from 'sonner'

interface ClassificationAnalyticsProps {
  modelId: string
  featureImportance?: Array<{ feature: string; importance: number }>
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  </div>
)

export default function ClassificationAnalytics({ 
  modelId,
  featureImportance = [] 
}: ClassificationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ClassificationAnalyticsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [modelId])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await modelService.getClassificationAnalytics(modelId)
      
      if (!response.data.has_data) {
        toast.info("No prediction data available for visualization")
        setAnalytics(null)
        return
      }
      
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to load classification analytics:', error)
      toast.error("Failed to load analytics data")
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <p className="text-muted-foreground mb-2">No analytics data available</p>
          <p className="text-sm text-muted-foreground">
            Train your model to generate classification analytics
          </p>
        </CardContent>
      </Card>
    )
  }

  // Quality color coding
  const qualityColorMap: Record<string, string> = {
    excellent: '#10b981',
    strong: '#22c55e',
    good: '#f59e0b',
    moderate: '#f97316',
    weak: '#ef4444'
  }
  const qualityColor = qualityColorMap[analytics.interpretation.quality] || '#6b7280'

  // Organize confusion matrix into grid
  const classes = Array.from(new Set(analytics.confusion_matrix.map(cm => cm.actual)))
  const matrixSize = classes.length

  return (
    <div className="space-y-6">
      {/* Performance Summary Card */}
      <Card 
        className="border-2"
        style={{ 
          borderColor: `${qualityColor}33`,
          backgroundColor: `${qualityColor}0D`
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${qualityColor}22` }}
            >
              {analytics.interpretation.quality === 'excellent' || 
               analytics.interpretation.quality === 'strong' ? (
                <CheckCircle2 className="w-6 h-6" style={{ color: qualityColor }} />
              ) : (
                <AlertCircle className="w-6 h-6" style={{ color: qualityColor }} />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg capitalize">
                  {analytics.interpretation.quality} Performance
                </h3>
                <span 
                  className="text-sm px-2 py-0.5 rounded" 
                  style={{ 
                    backgroundColor: `${qualityColor}22`, 
                    color: qualityColor 
                  }}
                >
                  {(analytics.overall_metrics.accuracy * 100).toFixed(1)}% Accuracy
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Model {analytics.interpretation.quality_message}
              </p>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-500">Accuracy</div>
                  <div className="text-sm font-semibold">
                    {(analytics.overall_metrics.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-500">Precision</div>
                  <div className="text-sm font-semibold">
                    {(analytics.overall_metrics.precision * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-500">F1 Score</div>
                  <div className="text-sm font-semibold">
                    {(analytics.overall_metrics.f1_score * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-500">Classes</div>
                  <div className="text-sm font-semibold">
                    {analytics.overall_metrics.n_classes}
                  </div>
                </div>
              </div>

              {/* Class Imbalance Warning */}
              {analytics.interpretation.has_imbalance && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-3 mb-3">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 text-sm font-medium mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Class Imbalance Detected
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-300">
                    Performance varies significantly across classes. 
                    Best: <strong>{analytics.interpretation.best_class}</strong>, 
                    Worst: <strong>{analytics.interpretation.worst_class}</strong>
                  </p>
                </div>
              )}

              {/* Issues */}
              {analytics.interpretation.issues.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-3">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm font-medium mb-2">
                    <Info className="w-4 h-4" />
                    Insights
                  </div>
                  <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                    {analytics.interpretation.issues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analytics.interpretation.recommendations.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-3">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 text-sm font-medium mb-2">
                    <Lightbulb className="w-4 h-4" />
                    Recommendations
                  </div>
                  <ul className="text-xs text-purple-600 dark:text-purple-300 space-y-1">
                    {analytics.interpretation.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Toggle Details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
              >
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {showDetails ? 'Hide' : 'Show'} detailed statistics
              </button>

              {showDetails && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-500">Total Predictions:</span>
                    <span className="font-medium">{analytics.overall_metrics.total_predictions}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-500">Correct:</span>
                    <span className="font-medium">{analytics.overall_metrics.correct_predictions}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-500">Balance Score:</span>
                    <span className="font-medium">{analytics.interpretation.balance_score.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-500">Recall:</span>
                    <span className="font-medium">{(analytics.overall_metrics.recall * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Importance */}
      {featureImportance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
            <CardDescription>
              Most influential features in predictions. Higher values indicate stronger impact on classification decisions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis 
                  dataKey="feature" 
                  type="category" 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  width={120} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar 
                  dataKey="importance" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Confusion Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Confusion Matrix</CardTitle>
          <CardDescription>
            Shows how well the model classifies each category. Diagonal values (correct predictions) should be highest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 dark:bg-muted/20 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How to read this matrix:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><strong>Diagonal cells (green)</strong> show correct predictions</li>
                  <li><strong>Off-diagonal cells (red)</strong> show misclassifications</li>
                  <li>Higher diagonal values = better model performance</li>
                  <li>High off-diagonal values = confusion between classes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confusion Matrix Grid */}
          <div 
            className="grid gap-4 mb-6"
            style={{ 
              gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))` 
            }}
          >
            {analytics.confusion_matrix.map((item, idx) => (
              <Card 
                key={idx} 
                className={cn(
                  "border-2 transition-all hover:shadow-md",
                  item.is_correct
                    ? "border-green-500/20 bg-green-50/50 dark:bg-green-950/20 hover:border-green-500/40" 
                    : "border-red-500/20 bg-red-50/50 dark:bg-red-950/20 hover:border-red-500/40"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">
                        Predicted: <span className="font-medium text-foreground">{item.predicted}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Actual: <span className="font-medium text-foreground">{item.actual}</span>
                      </div>
                    </div>
                    {item.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{item.count}</p>
                    <span className="text-sm text-muted-foreground">samples</span>
                  </div>

                  <div className={cn(
                    "mt-2 text-xs font-medium",
                    item.is_correct 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  )}>
                    {item.is_correct ? "✓ Correct" : "✗ Misclassified"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Matrix Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Correct</span>
              </div>
              <p className="text-2xl font-bold">{analytics.overall_metrics.correct_predictions}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((analytics.overall_metrics.correct_predictions / analytics.overall_metrics.total_predictions) * 100).toFixed(1)}% of predictions
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Misclassified</span>
              </div>
              <p className="text-2xl font-bold">
                {analytics.overall_metrics.total_predictions - analytics.overall_metrics.correct_predictions}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {(((analytics.overall_metrics.total_predictions - analytics.overall_metrics.correct_predictions) / analytics.overall_metrics.total_predictions) * 100).toFixed(1)}% of predictions
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Accuracy</span>
              </div>
              <p className="text-2xl font-bold">
                {(analytics.overall_metrics.accuracy * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Overall performance
              </p>
            </div>
          </div>

          {/* Top Confusions */}
          {analytics.top_confusions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3">Most Common Misclassifications</h4>
              <div className="space-y-2">
                {analytics.top_confusions.map((confusion, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        <strong>{confusion.actual}</strong> → <strong>{confusion.predicted}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{confusion.count} times</span>
                      <span className="text-xs text-muted-foreground">
                        ({confusion.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Class Performance Breakdown */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Per-Class Performance</h4>
            <div className="space-y-3">
              {analytics.class_metrics.map((classMetric, idx) => (
                <div 
                  key={idx} 
                  className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{classMetric.class}</span>
                    <span className="text-xs text-muted-foreground">
                      {classMetric.support} samples
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Precision</div>
                      <div className="font-semibold">
                        {(classMetric.precision * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Recall</div>
                      <div className="font-semibold">
                        {(classMetric.recall * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">F1-Score</div>
                      <div className="font-semibold">
                        {(classMetric.f1_score * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interpretation Guide */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Understanding Metrics:
                </p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                  <li><strong>Precision:</strong> Of all predicted positives, how many were correct?</li>
                  <li><strong>Recall:</strong> Of all actual positives, how many did we find?</li>
                  <li><strong>F1-Score:</strong> Harmonic mean balancing precision and recall</li>
                  <li><strong>Support:</strong> Number of samples in each class</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}