// components/analytics/RegressionAnalytics.tsx
"use client"

import React, { useState, useEffect } from 'react'
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
  Legend,
  Label
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Info, 
  AlertCircle, 
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Activity,
  TrendingUp
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { modelService, RegressionAnalytics as RegressionAnalyticsType } from '@/lib/services/model-service'
import { toast } from 'sonner'

interface RegressionAnalyticsProps {
  modelId: string
  featureImportance?: Array<{ feature: string; importance: number }>
}

// Custom Tooltip Components
const ScatterTooltip = ({ active, payload, analytics }: any) => {
  if (!active || !payload || !payload.length) return null
  
  const data = payload[0].payload
  const error = Math.abs(data.residual)
  const errorPct = (error / data.actual * 100).toFixed(1)

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Actual:</span>
          <span className="font-semibold">{data.actual.toFixed(4)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Predicted:</span>
          <span className="font-semibold">{data.predicted.toFixed(4)}</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500">Error:</span>
            <span className={cn(
              "font-semibold",
              data.is_outlier ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
            )}>
              {data.residual.toFixed(4)} ({errorPct}%)
            </span>
          </div>
          {data.is_outlier && (
            <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle className="w-3 h-3" />
              <span>Outlier detected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ResidualTooltip = ({ active, payload, analytics }: any) => {
  if (!active || !payload || !payload.length) return null
  
  const data = payload[0].payload
  const withinBounds = Math.abs(data.residual) <= analytics.statistics.prediction_margin

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Sample:</span>
          <span className="font-semibold">#{data.index}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Residual:</span>
          <span className={cn(
            "font-semibold",
            withinBounds ? 'text-green-600' : 'text-orange-500'
          )}>
            {data.residual.toFixed(4)}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {withinBounds 
            ? '✓ Within 95% prediction interval' 
            : '⚠ Outside typical range'}
        </div>
      </div>
    </div>
  )
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
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[350px] w-full" />
      </CardContent>
    </Card>
  </div>
)

export default function RegressionAnalytics({ modelId, featureImportance = [] }: RegressionAnalyticsProps) {
  const [analytics, setAnalytics] = useState<RegressionAnalyticsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [modelId])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await modelService.getRegressionAnalytics(modelId)
      
      if (!response.data.has_data) {
        toast.info("No prediction data available for visualization")
        setAnalytics(null)
        return
      }
      
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to load regression analytics:', error)
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
            Train your model to generate prediction analytics
          </p>
        </CardContent>
      </Card>
    )
  }

  // Prepare residual data with index
  const residualData = analytics.scatter_data.map((d, i) => ({
    index: i + 1,
    residual: d.residual,
    withinBounds: Math.abs(d.residual) <= analytics.statistics.prediction_margin
  }))

  // Quality color coding
  const qualityColorMap: Record<string, string> = {
    excellent: '#10b981',
    strong: '#22c55e',
    moderate: '#f59e0b',
    weak: '#f97316',
    poor: '#ef4444'
  }
  const qualityColor = qualityColorMap[analytics.interpretation.r2_quality] || '#6b7280'

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
              {analytics.interpretation.r2_quality === 'excellent' || 
               analytics.interpretation.r2_quality === 'strong' ? (
                <CheckCircle2 className="w-6 h-6" style={{ color: qualityColor }} />
              ) : (
                <AlertCircle className="w-6 h-6" style={{ color: qualityColor }} />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg capitalize">
                  {analytics.interpretation.r2_quality} Performance
                </h3>
                <span 
                  className="text-sm px-2 py-0.5 rounded" 
                  style={{ 
                    backgroundColor: `${qualityColor}22`, 
                    color: qualityColor 
                  }}
                >
                  R² = {analytics.statistics.r2_score.toFixed(4)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Model {analytics.interpretation.r2_message}
              </p>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-500">MAE</div>
                  <div className="text-sm font-semibold">
                    {analytics.statistics.mae.toFixed(4)}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-500">RMSE</div>
                  <div className="text-sm font-semibold">
                    {analytics.statistics.rmse.toFixed(4)}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
                  <div className="text-xs text-gray-500">Outliers</div>
                  <div className="text-sm font-semibold">
                    {analytics.statistics.outlier_percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Issues */}
              {analytics.interpretation.issues.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-3 mb-3">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 text-sm font-medium mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Detected Issues
                  </div>
                  <ul className="text-xs text-orange-600 dark:text-orange-300 space-y-1">
                    {analytics.interpretation.issues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analytics.interpretation.recommendations.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm font-medium mb-2">
                    <Lightbulb className="w-4 h-4" />
                    Recommendations
                  </div>
                  <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
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
                    <span className="text-gray-500">Mean Residual:</span>
                    <span className="font-medium">
                      {analytics.statistics.residual_mean.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-500">Std Dev:</span>
                    <span className="font-medium">
                      {analytics.statistics.residual_std.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-500">Skewness:</span>
                    <span className="font-medium">
                      {analytics.statistics.residual_skewness.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-500">Normality p-value:</span>
                    <span className="font-medium">
                      {analytics.statistics.normality_p_value.toFixed(4)}
                    </span>
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
              Most influential features in predictions. Higher values indicate stronger impact on model decisions.
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

      {/* Actual vs Predicted Scatter */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Accuracy</CardTitle>
          <CardDescription>
            Points closer to the diagonal line indicate better predictions. 
            Red points are outliers (errors &gt; 3σ).
          </CardDescription>
          {analytics.sample_info.is_sampled && (
            <div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
              <Info className="w-3 h-3" />
              Showing {analytics.sample_info.displayed_samples} of {analytics.sample_info.total_samples} samples
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              
              <XAxis 
                type="number" 
                dataKey="actual"
                domain={[analytics.domain.min, analytics.domain.max]}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              >
                <Label 
                  value="Actual Values" 
                  position="insideBottom" 
                  offset={-10} 
                  style={{ fill: '#6b7280' }} 
                />
              </XAxis>
              
              <YAxis 
                type="number"
                dataKey="predicted"
                domain={[analytics.domain.min, analytics.domain.max]}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              >
                <Label 
                  value="Predicted Values" 
                  angle={-90} 
                  position="insideLeft" 
                  style={{ fill: '#6b7280' }} 
                />
              </YAxis>

              <Tooltip content={<ScatterTooltip analytics={analytics} />} />
              
              {/* 95% Prediction Interval */}
              <ReferenceArea
                x1={analytics.domain.min}
                x2={analytics.domain.max}
                y1={analytics.domain.min - analytics.statistics.prediction_margin}
                y2={analytics.domain.max + analytics.statistics.prediction_margin}
                fill="#3b82f6"
                fillOpacity={0.05}
              />

              {/* Perfect Prediction Line */}
              <ReferenceLine
                segment={[
                  { x: analytics.domain.min, y: analytics.domain.min },
                  { x: analytics.domain.max, y: analytics.domain.max }
                ]}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: 'Perfect Prediction', 
                  position: 'insideTopRight', 
                  fill: '#ef4444',
                  fontSize: 11
                }}
              />

              {/* Data Points */}
              <Scatter name="Predictions" data={analytics.scatter_data}>
                {analytics.scatter_data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.is_outlier ? '#ef4444' : '#3b82f6'}
                    fillOpacity={entry.is_outlier ? 0.8 : 0.6}
                    r={entry.is_outlier ? 5 : 4}
                  />
                ))}
              </Scatter>

              <Legend 
                verticalAlign="top" 
                height={36}
                content={() => (
                  <div className="flex items-center justify-center gap-4 text-xs mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Normal Predictions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Outliers ({analytics.statistics.outlier_count})</span>
                    </div>
                  </div>
                )}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Residual Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Residual Distribution</CardTitle>
          <CardDescription>
            Residuals should be randomly scattered around zero with no patterns. 
            The shaded area shows the 95% prediction interval (±{analytics.statistics.prediction_margin.toFixed(2)}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={residualData} margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              
              <XAxis 
                dataKey="index"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              >
                <Label 
                  value="Sample Index" 
                  position="insideBottom" 
                  offset={-10} 
                  style={{ fill: '#6b7280' }} 
                />
              </XAxis>
              
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }}>
                <Label 
                  value="Residual Error" 
                  angle={-90} 
                  position="insideLeft" 
                  style={{ fill: '#6b7280' }} 
                />
              </YAxis>

              <Tooltip content={<ResidualTooltip analytics={analytics} />} />

              {/* 95% Confidence Bands */}
              <ReferenceArea
                y1={-analytics.statistics.prediction_margin}
                y2={analytics.statistics.prediction_margin}
                fill="#22c55e"
                fillOpacity={0.1}
              />

              {/* Zero Line */}
              <ReferenceLine 
                y={0} 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ 
                  value: 'Zero Error', 
                  position: 'right', 
                  fill: '#ef4444',
                  fontSize: 11
                }}
              />

              {/* Upper/Lower Bounds */}
              <ReferenceLine 
                y={analytics.statistics.prediction_margin} 
                stroke="#22c55e" 
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <ReferenceLine 
                y={-analytics.statistics.prediction_margin} 
                stroke="#22c55e" 
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />

              {/* Residual Line */}
              <Line
                type="monotone"
                dataKey="residual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={payload.withinBounds ? 3 : 5}
                      fill={payload.withinBounds ? '#3b82f6' : '#f97316'}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  )
                }}
                activeDot={{ r: 6 }}
              />

              <Legend 
                verticalAlign="top" 
                height={36}
                content={() => (
                  <div className="flex items-center justify-center gap-4 text-xs mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span>95% Prediction Interval</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>Outside Bounds</span>
                    </div>
                  </div>
                )}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Residual Statistics Summary */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Mean Residual</div>
              <div className="font-semibold">
                {analytics.statistics.residual_mean.toFixed(4)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {Math.abs(analytics.statistics.residual_mean) < 0.1 
                  ? '✓ Well centered' 
                  : '⚠ Bias detected'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Distribution</div>
              <div className="font-semibold">
                {analytics.interpretation.residuals_normal ? 'Normal' : 'Non-normal'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {analytics.interpretation.residuals_normal 
                  ? '✓ Good fit' 
                  : '⚠ Check patterns'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Outside Bounds</div>
              <div className="font-semibold">
                {residualData.filter(d => !d.withinBounds).length} samples
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {((residualData.filter(d => !d.withinBounds).length / residualData.length) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}