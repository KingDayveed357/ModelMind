import { Card, CardContent } from "@/components/ui/card"
import { Brain, TrendingUp, Clock, Upload } from "lucide-react"
import type { Model, ModelSummary } from "@/lib/services/model-service"

interface MetricsGridProps {
  summary: ModelSummary | null
  recentModels: Model[]
  totalDatasets: number
}

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  iconBgColor: string
}

function MetricCard({ title, value, subtitle, icon, iconBgColor }: MetricCardProps) {
  return (
    <Card className="glass transition-smooth hover:shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-2xl font-semibold">{value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${iconBgColor} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricsGrid({ summary, recentModels, totalDatasets }: MetricsGridProps) {
  const calculateAvgPerformance = () => {
    if (!summary) return { value: "N/A", label: "Performance" }
    
    const hasRegression = (summary.regression_count || 0) > 0
    const hasClassification = (summary.classification_count || 0) > 0
    
    let value = "N/A"
    let label = "Performance"
    
    if (hasRegression && !hasClassification && summary.avg_r2 !== null && summary.avg_r2 !== undefined) {
      value = `${(summary.avg_r2 * 100).toFixed(1)}%`
      label = "Avg R² Score"
    } else if (!hasRegression && hasClassification && summary.avg_accuracy !== null && summary.avg_accuracy !== undefined) {
      value = `${(summary.avg_accuracy * 100).toFixed(1)}%`
      label = "Avg Accuracy"
    } else if (hasRegression && hasClassification) {
      const r2Val = summary.avg_r2 || 0
      const accVal = summary.avg_accuracy || 0
      const count = (summary.avg_r2 ? 1 : 0) + (summary.avg_accuracy ? 1 : 0)
      const avg = count > 0 ? (r2Val + accVal) / count : 0
      value = `${(avg * 100).toFixed(1)}%`
      label = "Avg Performance"
    }
    
    return { value, label }
  }

  const parseTrainingTime = (timeStr: string | number | undefined): number => {
    if (!timeStr) return 0
    if (typeof timeStr === 'number') return timeStr

    const parts = String(timeStr).split(':')
    if (parts.length === 3) {
      const hours = parseFloat(parts[0])
      const minutes = parseFloat(parts[1])
      const seconds = parseFloat(parts[2])
      return hours * 3600 + minutes * 60 + seconds
    }
    
    return parseFloat(String(timeStr)) || 0
  }

  const formatTrainingTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "N/A"
    if (seconds < 0.1) return `${(seconds * 1000).toFixed(0)}ms`
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
    return `${(seconds / 3600).toFixed(1)}h`
  }

  const calculateAvgTrainingTime = (): string => {
    if (!recentModels || recentModels.length === 0) return "N/A"
    
    const totalSeconds = recentModels.reduce((sum, m) => {
      const seconds = parseTrainingTime(m.training_time)
      return sum + seconds
    }, 0)
    
    const avgSeconds = totalSeconds / recentModels.length
    return formatTrainingTime(avgSeconds)
  }

  const totalModels = summary?.total_models || 0
  const avgPerf = calculateAvgPerformance()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard
        title="Total Models"
        value={totalModels.toString()}
        subtitle={`${summary?.regression_count || 0} regression, ${summary?.classification_count || 0} classification`}
        icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />}
        iconBgColor="bg-primary/10"
      />
      
      <MetricCard
        title={avgPerf.label}
        value={avgPerf.value}
        subtitle="Across all models"
        icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />}
        iconBgColor="bg-accent/10"
      />
      
      <MetricCard
        title="Avg Training Time"
        value={calculateAvgTrainingTime()}
        subtitle="Per model"
        icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6 text-chart-3" />}
        iconBgColor="bg-chart-3/10"
      />
      
      <MetricCard
        title="Datasets"
        value={totalDatasets.toString()}
        subtitle="Unique datasets"
        icon={<Upload className="w-5 h-5 sm:w-6 sm:h-6 text-chart-4" />}
        iconBgColor="bg-chart-4/10"
      />
    </div>
  )
}