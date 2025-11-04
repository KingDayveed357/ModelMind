// app/dashboard/models/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Brain,
  Download,
  Share2,
  TrendingUp,
  Calendar,
  Database,
  Target,
  Edit2,
  Loader2,
  Upload,
  FileText,
  Activity,
  TrendingDown,
  Info,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceArea,
  ComposedChart,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts"
import { modelService } from "@/lib/services/model-service"
import RegressionAnalytics from '@/components/analytics/regression-analytics'
import ClassificationAnalytics from '@/components/analytics/classification-analytics'
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {toast} from "sonner"


// Performance analysis helper
const analyzePerformance = (metrics: any, problemType: string) => {
  if (problemType === "regression") {
    const r2 = metrics.r2_score || 0
    const rmse = metrics.rmse || 0
    const mae = metrics.mae || 0

    let quality = "Poor"
    let color = "red"
    let insight = ""

    if (r2 > 0.9) {
      quality = "Excellent"
      color = "green"
      insight = "Your model explains over 90% of the variance in the data. This indicates exceptional predictive power and reliability for production use."
    } else if (r2 > 0.7) {
      quality = "Strong"
      color = "green"
      insight = "Your model captures most patterns in the data effectively. It should perform well on similar data and is suitable for most applications."
    } else if (r2 > 0.5) {
      quality = "Good"
      color = "yellow"
      insight = "Your model identifies significant patterns but may miss some nuances. Consider feature engineering or trying different algorithms for improvement."
    } else if (r2 > 0.3) {
      quality = "Moderate"
      color = "yellow"
      insight = "Your model provides some predictive value but has considerable room for improvement. Review feature selection and data quality."
    } else if (r2 >= 0) {
      quality = "Weak"
      color = "orange"
      insight = "Your model struggles to capture meaningful patterns. Consider collecting more data, better features, or different modeling approaches."
    } else {
      quality = "Very Poor"
      color = "red"
      insight = "Negative R² means the model performs worse than simply predicting the mean. This indicates fundamental issues with the model or data."
    }

    return {
      quality,
      color,
      insight,
      details: [
        { label: "Prediction Accuracy", value: `${(r2 * 100).toFixed(1)}% variance explained` },
        { label: "Average Error", value: `${mae.toFixed(2)} units` },
        { label: "Error Magnitude", value: `RMSE: ${rmse.toFixed(2)}` },
      ],
    }
  } else {
    const accuracy = metrics.accuracy || 0
    const precision = metrics.precision || 0
    const f1 = metrics.f1_score || 0

    let quality = "Poor"
    let color = "red"
    let insight = ""

    if (accuracy > 0.95 && f1 > 0.95) {
      quality = "Excellent"
      color = "green"
      insight = "Your model achieves exceptional classification performance with high accuracy and balanced precision/recall. Ready for production deployment."
    } else if (accuracy > 0.85 && f1 > 0.85) {
      quality = "Strong"
      color = "green"
      insight = "Your model performs very well across classes with good balance. Suitable for most real-world applications with minimal false positives/negatives."
    } else if (accuracy > 0.75) {
      quality = "Good"
      color = "yellow"
      insight = "Your model shows solid performance but may benefit from additional tuning or more training data to improve minority class predictions."
    } else if (accuracy > 0.6) {
      quality = "Moderate"
      color = "orange"
      insight = "Your model provides reasonable classification but has noticeable error rates. Consider balancing your dataset or trying ensemble methods."
    } else {
      quality = "Weak"
      color = "red"
      insight = "Your model struggles with classification accuracy. Review class imbalance, feature quality, and consider more sophisticated algorithms."
    }

    return {
      quality,
      color,
      insight,
      details: [
        { label: "Overall Accuracy", value: `${(accuracy * 100).toFixed(1)}%` },
        { label: "Precision", value: `${(precision * 100).toFixed(1)}%` },
        { label: "F1 Score", value: `${(f1 * 100).toFixed(1)}%` },
      ],
    }
  }
}

// Skeleton loaders
const MetricCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </CardContent>
  </Card>
)

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </Card>
)

export default function ViewModelPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = params.id as string

  
  const [model, setModel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [modelName, setModelName] = useState("")
  const [modelDescription, setModelDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [featureImportance, setFeatureImportance] = useState<any[]>([])
  const [predictionHistory, setPredictionHistory] = useState<any[]>([])
  const [loadingCharts, setLoadingCharts] = useState(true)
  const [datasetPreview, setDatasetPreview] = useState<any>(null)
  const [showDatasetPreview, setShowDatasetPreview] = useState(false)
  const [actualPredData, setActualPredData] = useState<any[]>([])
  const [minVal, setMinVal] = useState(0)
  const [maxVal, setMaxVal] = useState(100)
  const [residualData, setResidualData] = useState<any[]>([])
  const [loadingPredictions, setLoadingPredictions] = useState(false)


  useEffect(() => {
    loadModelDetails()
  }, [modelId])

  useEffect(() => {
  if (model && !loadingCharts) {
    loadPredictionData()
    loadResidualData()
  }
}, [model, loadingCharts])


  
const loadPredictionData = async () => {
  if (!modelId) return
  
  setLoadingPredictions(true)
  try {
    const response = await modelService.getPredictionsData(modelId)
    if (response.data && response.data.actual && response.data.predicted) {
      const data = response.data.actual.map((actual: number, idx: number) => ({
        actual: actual,
        predicted: response.data.predicted[idx]
      }))
      setActualPredData(data)
      
      // Calculate min/max for reference line
      const allValues = [...response.data.actual, ...response.data.predicted]
      const min = Math.min(...allValues)
      const max = Math.max(...allValues)
      const padding = (max - min) * 0.1
      setMinVal(min - padding)
      setMaxVal(max + padding)
    }
  } catch (error) {
    console.error('Failed to load predictions:', error)
  } finally {
    setLoadingPredictions(false)
  }
}

const loadResidualData = async () => {
  if (!modelId) return
  
  try {
    const response = await modelService.getPredictionsData(modelId)
    if (response.data && response.data.residuals) {
      const data = response.data.residuals.map((residual: number, idx: number) => ({
        index: idx + 1,
        residual: residual
      }))
      setResidualData(data)
    } else if (response.data && response.data.actual && response.data.predicted) {
      // Calculate residuals if not provided
      const data = response.data.actual.map((actual: number, idx: number) => ({
        index: idx + 1,
        residual: actual - response.data.predicted[idx]
      }))
      setResidualData(data)
    }
  } catch (error) {
    console.error('Failed to load residuals:', error)
  }
}

  const loadModelDetails = async () => {
    try {
      setLoading(true)
      const response = await modelService.getModelDetails(modelId)
      setModel(response.data)
      setModelName(response.data.model_name)
      setModelDescription(response.data.description || "")
      
      // Load additional data
      Promise.all([
        loadFeatureImportance(),
        loadPredictionHistory(),
      ]).finally(() => setLoadingCharts(false))
    } catch (error) {
      toast.error("Failed to load model", {
        description: error instanceof Error ? error.message : "Failed to load model"
      })
    } finally {
      setLoading(false)
    }
  }


const loadDatasetPreview = async () => {
  setDatasetPreview({ loading: true, data: null, error: null })

  try {
    // Use the new model service method to get dataset preview
    const response = await modelService.getDatasetPreview(modelId, 10)
    
    setDatasetPreview({
      loading: false,
      data: response.data,
      error: null
    })

  } catch (error) {
    console.error("Failed to load dataset preview:", error)
    setDatasetPreview({
      loading: false,
      data: null,
      error: "Failed to load dataset preview. Please try again."
    })
  }
}

  const loadFeatureImportance = async () => {
    try {
      const response = await modelService.getFeatureImportance(modelId)
      if (response.data.features.length > 0) {
        const importanceData = response.data.features.map((feature, idx) => ({
          feature,
          importance: response.data.importance[idx] || 0,
        }))
        setFeatureImportance(importanceData.sort((a, b) => b.importance - a.importance).slice(0, 10))
      }
    } catch (error) {
      console.error("Failed to load feature importance:", error)
    }
  }

  const loadPredictionHistory = async () => {
    try {
      const response = await modelService.getPredictionHistory(modelId)
      setPredictionHistory(response.data)
    } catch (error) {
      console.error("Failed to load prediction history:", error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await modelService.updateModel(modelId, {
        model_name: modelName,
        description: modelDescription,
      })

      toast.success("Model updated successfully")

      setEditDialogOpen(false)
      loadModelDetails()
    } catch (error) {
      toast.error("Failed to update model")
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await modelService.exportModel(modelId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${model.model_name}.pkl`
      a.click()
      URL.revokeObjectURL(url)

      toast.success("Model exported successfully")
    } catch (error) {
      toast.error("Failed to export model")
    }
  }

  const handleMakePrediction = () => {
    router.push(`/dashboard/predict?model=${modelId}`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>

          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!model) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Model not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const isRegression = model.problem_type === "regression"
  const performance = analyzePerformance(model.metrics, model.problem_type)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-serif font-normal">{model.model_name}</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Badge variant="secondary">{model.model_type}</Badge>
              <Badge variant="outline">{model.problem_type}</Badge>
            </div>
            <p className="text-muted-foreground">
              {model.description || "Detailed analysis and performance metrics"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button> */}
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExport}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" className="gap-2" onClick={handleMakePrediction}>
              <Upload className="w-4 h-4" />
              Predict
            </Button>
          </div>
        </div>

        {/* Performance Alert */}
        {/* <Card className={cn(
          "border-2",
          performance.color === "green" && "border-green-500/20 bg-green-50/50 dark:bg-green-950/20",
          performance.color === "yellow" && "border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20",
          performance.color === "orange" && "border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20",
          performance.color === "red" && "border-red-500/20 bg-red-50/50 dark:bg-red-950/20"
        )}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                performance.color === "green" && "bg-green-100 text-green-600 dark:bg-green-900/30",
                performance.color === "yellow" && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30",
                performance.color === "orange" && "bg-orange-100 text-orange-600 dark:bg-orange-900/30",
                performance.color === "red" && "bg-red-100 text-red-600 dark:bg-red-900/30"
              )}>
                {performance.color === "green" ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : performance.color === "red" ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">Model Performance: {performance.quality}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{performance.insight}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {performance.details.map((detail, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{detail.label}</span>
                      <span className="text-sm font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isRegression ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-muted-foreground">R² Score</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px]">
                              <p className="text-sm">
                                R² measures how well the model explains variance. 1.0 is perfect, 0.0 means the model is as good as predicting the mean.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-2xl font-semibold">{model.metrics.r2_score?.toFixed(4)}</p>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          model.metrics.r2_score > 0.7 ? "bg-green-500" :
                          model.metrics.r2_score > 0.4 ? "bg-yellow-500" :
                          model.metrics.r2_score >= 0 ? "bg-orange-500" : "bg-red-500"
                        )} />
                        <p className="text-xs font-medium">
                          {model.metrics.r2_score > 0.9 ? "Excellent fit" :
                           model.metrics.r2_score > 0.7 ? "Strong fit" :
                           model.metrics.r2_score > 0.5 ? "Good fit" :
                           model.metrics.r2_score > 0.3 ? "Moderate fit" :
                           model.metrics.r2_score >= 0 ? "Weak fit" : "Poor fit"}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      model.metrics.r2_score >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {model.metrics.r2_score >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">RMSE</p>
                      <p className="text-2xl font-semibold">{model.metrics.rmse?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Root Mean Squared Error</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">MAE</p>
                      <p className="text-2xl font-semibold">{model.metrics.mae?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Mean Absolute Error</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-chart-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="text-2xl font-semibold">
                        {(model.metrics.accuracy * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-accent">Overall performance</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">Precision</p>
                      <p className="text-2xl font-semibold">
                        {(model.metrics.precision * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Positive predictive value</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">F1 Score</p>
                      <p className="text-2xl font-semibold">
                        {(model.metrics.f1_score * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Harmonic mean</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-chart-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(model.created_at), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">Training date</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="visualizations" className="text-xs sm:text-sm">Charts</TabsTrigger>
            <TabsTrigger value="parameters" className="text-xs sm:text-sm">Params</TabsTrigger>
            <TabsTrigger value="data" className="text-xs sm:text-sm">Data</TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs sm:text-sm">Predictions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Information</CardTitle>
                  <CardDescription>Configuration and metadata</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Model Type</span>
                      <span className="text-sm font-medium">{model.model_type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Problem Type</span>
                      <Badge variant="secondary">{model.problem_type}</Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Target Variable</span>
                      <span className="text-sm font-medium">{model.target_column}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Training Time</span>
                      <span className="text-sm font-medium">{model.training_time}s</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="secondary">{model.status}</Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Predictions Made</span>
                      <span className="text-sm font-medium">{model.prediction_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Detailed model evaluation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {Object.entries(model.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium">
                          {typeof value === "number" ? value.toFixed(4) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Features Used ({model.feature_columns?.length || 0})</CardTitle>
                <CardDescription>Input variables for prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {model.feature_columns?.map((feature: string, index: number) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


 {/* Visualization Tab */}
 <TabsContent value="visualizations" className="space-y-6 mt-6">
  {loadingCharts ? (
    <>
      <ChartSkeleton />
      <ChartSkeleton />
    </>
  ) : (
    <>
      {isRegression ? (
        <RegressionAnalytics 
          modelId={modelId}
          featureImportance={featureImportance}
        />
      ) : (
        <ClassificationAnalytics 
          modelId={modelId}
          featureImportance={featureImportance}
        />
      )}
    </>
  )}
</TabsContent>

{/* <TabsContent value="visualizations" className="space-y-6 mt-6">
  {loadingCharts || loadingPredictions ? (
    <>
      <ChartSkeleton />
      <ChartSkeleton />
    </>
  ) : (
    <>
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
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                <XAxis type="number" className="text-xs" stroke="hsl(var(--foreground))" />
                <YAxis dataKey="feature" type="category" className="text-xs" width={120} stroke="hsl(var(--foreground))" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {isRegression ? (
        <>
         
          <Card>
            <CardHeader>
              <CardTitle>Actual vs Predicted Values</CardTitle>
              <CardDescription>
                Perfect predictions would fall on the diagonal line. Closer points indicate better accuracy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 dark:bg-muted/20 p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong>How to interpret:</strong> Points above the line mean the model overestimated, 
                  points below mean it underestimated. Tighter clustering around the line indicates better predictions.
                </p>
              </div>
              
              {actualPredData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                    <XAxis 
                      dataKey="actual" 
                      name="Actual Values" 
                      type="number"
                      domain={[minVal, maxVal]}
                      className="text-xs"
                      stroke="hsl(var(--foreground))"
                      label={{ 
                        value: 'Actual Values', 
                        position: 'insideBottom', 
                        offset: -10,
                        style: { fill: 'hsl(var(--foreground))' }
                      }}
                    />
                    <YAxis 
                      dataKey="predicted" 
                      name="Predicted Values" 
                      type="number"
                      domain={[minVal, maxVal]}
                      className="text-xs"
                      stroke="hsl(var(--foreground))"
                      label={{ 
                        value: 'Predicted Values', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: 'hsl(var(--foreground))' }
                      }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))"
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: any) => value.toFixed(4)}
                    />
                    <Legend 
                      wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <ReferenceLine 
                      segment={[
                        { x: minVal, y: minVal }, 
                        { x: maxVal, y: maxVal }
                      ]} 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ 
                        value: "Perfect Prediction",
                        position: 'insideTopRight',
                        style: { fill: 'hsl(var(--foreground))' }
                      }}
                    />
                    <Scatter 
                      name="Predictions" 
                      data={actualPredData} 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    >
                      {actualPredData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(var(--primary))`}
                          opacity={0.7}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No prediction data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

         
          <Card>
            <CardHeader>
              <CardTitle>Residual Distribution</CardTitle>
              <CardDescription>
                Shows prediction errors. Ideally, residuals should be randomly distributed around zero with no patterns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 dark:bg-muted/20 p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Good signs:</strong> Random scatter around zero line, no funnel shape. 
                  <strong className="ml-2">Warning signs:</strong> Patterns, curves, or increasing spread indicate model issues.
                </p>
              </div>
              
              {residualData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={residualData} margin={{ top: 20, right: 30, bottom: 20, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                    <XAxis 
                      dataKey="index" 
                      className="text-xs"
                      stroke="hsl(var(--foreground))"
                      label={{ 
                        value: 'Sample Index', 
                        position: 'insideBottom', 
                        offset: -10,
                        style: { fill: 'hsl(var(--foreground))' }
                      }}
                    />
                    <YAxis 
                      className="text-xs"
                      stroke="hsl(var(--foreground))"
                      label={{ 
                        value: 'Residual Error', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: 'hsl(var(--foreground))' }
                      }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))"
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: any) => value.toFixed(4)}
                    />
                    <ReferenceLine 
                      y={0} 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="3 3"
                      strokeWidth={2}
                      label={{ 
                        value: "Zero Error",
                        position: 'right',
                        style: { fill: 'hsl(var(--foreground))' }
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="residual"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ 
                        r: 3, 
                        fill: 'hsl(var(--accent))',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No residual data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
       
        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>
              Shows how well the model classifies each category. Diagonal values (correct predictions) should be highest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 dark:bg-muted/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Reading the matrix:</strong> Each cell shows the count of predictions. 
                High diagonal values = accurate. High off-diagonal values = confusion between classes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { actual: "Class 0", predicted: "Class 0", value: 45, correct: true },
                { actual: "Class 0", predicted: "Class 1", value: 5, correct: false },
                { actual: "Class 1", predicted: "Class 0", value: 3, correct: false },
                { actual: "Class 1", predicted: "Class 1", value: 47, correct: true },
              ].map((item, idx) => (
                <Card key={idx} className={cn(
                  "border-2",
                  item.correct 
                    ? "border-green-500/20 bg-green-50/50 dark:bg-green-950/20" 
                    : "border-red-500/20 bg-red-50/50 dark:bg-red-950/20"
                )}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Actual: {item.actual} → Predicted: {item.predicted}
                    </p>
                    <p className="text-2xl font-semibold">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.correct ? "Correct predictions" : "Misclassifications"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )}
</TabsContent> */}

          {/* Parameters Tab */}
          <TabsContent value="parameters" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Parameters</CardTitle>
                <CardDescription>Configuration used during model training</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(model.parameters || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-medium">
                        {typeof value === "boolean" ? (
                          <Badge variant="secondary">{value ? "Yes" : "No"}</Badge>
                        ) : (
                          String(value)
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

      
    {/* Data Tab */}
{/* <TabsContent value="data" className="space-y-6 mt-6">
  <Card>
    <CardHeader>
      <CardTitle>Dataset Information</CardTitle>
      <CardDescription>Details about the training data</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {model.dataset_info && (
        <>
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{model.dataset_info.name}</h4>
              <p className="text-sm text-muted-foreground">
                {model.dataset_info.rows} rows • {model.dataset_info.columns} columns •{" "}
                {(model.dataset_info.file_size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent"
              onClick={() => {
                if (!showDatasetPreview) {
                  loadDatasetPreview()
                }
                setShowDatasetPreview(!showDatasetPreview)
              }}
              disabled={!model.dataset_info?.file_url}
            >
              {showDatasetPreview ? "Hide" : "View"} Dataset
            </Button>
          </div>

          {showDatasetPreview && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Dataset Preview</h4>
                {datasetPreview?.loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                )}
              </div>
              
              {datasetPreview?.error ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Failed to load dataset</span>
                  </div>
                  <p className="text-sm text-destructive/80">{datasetPreview.error}</p>
                </div>
              ) : datasetPreview?.data ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    First few rows of your training data:
                  </p>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          {datasetPreview.data.headers.map((header: string, i: number) => (
                            <th key={i} className="px-3 py-2 text-left font-medium border-r last:border-r-0">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {datasetPreview.data.rows.map((row: any[], i: number) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 border-r last:border-r-0">
                                {typeof cell === 'number' ? cell.toFixed(4) : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Showing first {datasetPreview.data.rows.length} rows of {model.dataset_info.rows} total
                  </p>
                </>
              ) : (
                <div className="bg-muted/30 p-8 rounded-lg text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click "View Dataset" to load the data preview
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
</TabsContent> */}

{/* Data Tab */}
<TabsContent value="data" className="space-y-6 mt-6">
  <Card>
    <CardHeader>
      <CardTitle>Dataset Information</CardTitle>
      <CardDescription>Details about the training data</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {model.dataset_info ? (
        <>
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{model.dataset_info.name}</h4>
              <p className="text-sm text-muted-foreground">
                {model.dataset_info.rows} rows • {model.dataset_info.columns} columns •{" "}
                {(model.dataset_info.file_size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent"
              onClick={() => {
                if (!showDatasetPreview) {
                  loadDatasetPreview()
                }
                setShowDatasetPreview(!showDatasetPreview)
              }}
            >
              {showDatasetPreview ? "Hide" : "View"} Dataset
            </Button>
          </div>

          {showDatasetPreview && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Dataset Preview</h4>
                {datasetPreview?.loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                )}
              </div>
              
              {datasetPreview?.error ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Failed to load dataset</span>
                  </div>
                  <p className="text-sm text-destructive/80">{datasetPreview.error}</p>
                </div>
              ) : datasetPreview?.data ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing original data (before preprocessing):
                  </p>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          {datasetPreview.data.headers.map((header: string, i: number) => (
                            <th 
                              key={i} 
                              className={cn(
                                "px-3 py-2 text-left font-medium border-r last:border-r-0",
                                header === model.target_column && "bg-accent/20"
                              )}
                            >
                              <div className="flex items-center gap-1">
                                {header}
                                {header === model.target_column && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Target className="w-3 h-3 text-accent" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Target variable</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {datasetPreview.data.rows.map((row: any[], i: number) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td 
                                key={j} 
                                className={cn(
                                  "px-3 py-2 border-r last:border-r-0",
                                  j === datasetPreview.data.headers.length - 1 && "bg-accent/10 font-medium"
                                )}
                              >
                                {typeof cell === 'number' ? cell.toFixed(4) : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      Showing first {datasetPreview.data.rows.length} rows of {datasetPreview.data.total_rows} total
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-accent/20 rounded"></div>
                        <span>Target column</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-muted rounded"></div>
                        <span>Feature columns</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-muted/30 p-8 rounded-lg text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click "View Dataset" to load the data preview
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <Database className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No dataset information available</p>
        </div>
      )}
    </CardContent>
  </Card>


  
</TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Prediction History</CardTitle>
                    <CardDescription>Recent predictions made with this model</CardDescription>
                  </div>
                  <Button size="sm" className="gap-2" onClick={handleMakePrediction}>
                    <Upload className="w-4 h-4" />
                    Make Prediction
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {predictionHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No predictions yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start making predictions to see your history here
                    </p>
                    <Button onClick={handleMakePrediction} size="sm">
                      Make Your First Prediction
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {predictionHistory.map((pred: any) => (
                      <div
                        key={pred.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{pred.source_file || "API Prediction"}</p>
                            <p className="text-sm text-muted-foreground">
                              {pred.n_samples} samples •{" "}
                              {format(new Date(pred.predicted_at), "MMM d, yyyy HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
         

        </Tabs>

        {/* Edit Model Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Model</DialogTitle>
              <DialogDescription>Update model name and description</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Enter model name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-description">Description</Label>
                <Input
                  id="model-description"
                  value={modelDescription}
                  onChange={(e) => setModelDescription(e.target.value)}
                  placeholder="Enter model description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}