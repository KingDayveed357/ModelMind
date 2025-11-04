import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Clock, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Model } from "@/lib/services/model-service"

interface RecentModelsProps {
  models: Model[]
  loading: boolean
}

function ModelCard({ model }: { model: Model }) {
  const router = useRouter()

  const getMetricDisplay = (model: Model) => {
    if (model.problem_type === "regression") {
      return {
        label: "R²",
        value: model.metrics?.r2_score?.toFixed(2) || "N/A",
        raw: model.metrics?.r2_score || 0
      }
    } else {
      return {
        label: "Accuracy",
        value: model.metrics?.accuracy?.toFixed(2) || "N/A",
        raw: model.metrics?.accuracy || 0
      }
    }
  }

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const metric = getMetricDisplay(model)

  return (
    <div
      onClick={() => router.push(`/dashboard/models/${model.id}`)}
      className="flex flex-col gap-3 p-3 sm:p-4 rounded-lg border border-border hover:border-primary/50 transition-smooth cursor-pointer group"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h4 className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors">
            {model.model_name}
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px] sm:text-xs">
              {model.model_type}
            </Badge>
            <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeAgo(model.created_at)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pl-0 sm:pl-14">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
          <span className="text-xs sm:text-sm font-medium">{metric.label} {metric.value}</span>
        </div>
        <span className="text-xs text-primary group-hover:underline">View →</span>
      </div>
    </div>
  )
}

function ModelCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

export function RecentModels({ models, loading }: RecentModelsProps) {
  const router = useRouter()

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">Recent Models</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your latest machine learning models
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard/history')}
            className="bg-transparent w-full sm:w-auto"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <ModelCardSkeleton key={i} />
            ))}
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No models trained yet</p>
            <Button onClick={() => router.push('/dashboard/train')}>
              Train Your First Model
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
