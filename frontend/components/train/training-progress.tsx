"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Timer } from "lucide-react"
import type { TrainingMetrics } from "@/lib/train-types"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

interface TrainingProgressProps {
  isTraining: boolean
  progress: number
  metrics: TrainingMetrics
  status: string
}

export function TrainingProgress({ isTraining, progress, metrics, status }: TrainingProgressProps) {
  const isRegression = metrics.r2 !== undefined || metrics.rmse !== undefined || metrics.mae !== undefined
  const isClassification = metrics.accuracy !== undefined || metrics.f1 !== undefined

    const getStatusIcon = () => {
    if (isTraining) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
    if (progress === 100) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
    if (status === "Training failed") {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return null
  }

  const formatMetric = (value: number) => {
    return (value * 100).toFixed(2) + "%"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* <Activity className="h-5 w-5" /> */}
          {getStatusIcon()}
          Training Progress
        </CardTitle>
        <CardDescription>{status || "Ready to start training"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {isTraining && (
          <div className="space-y-2">
            <Badge variant="outline" className="animate-pulse">
              Training in progress...
            </Badge>
          </div>
        )}

        {/* Metrics */}
        {Object.keys(metrics).length > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            {/* Regression metrics */}
            {isRegression && (
              <>
                {metrics.r2 !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground">R² Score</div>
                    <div className="font-semibold">{metrics.r2.toFixed(4)}</div>
                  </div>
                )}
                {metrics.rmse !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground">RMSE</div>
                    <div className="font-semibold">{metrics.rmse.toFixed(2)}</div>
                  </div>
                )}
                {metrics.mae !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground">MAE</div>
                    <div className="font-semibold">{metrics.mae.toFixed(2)}</div>
                  </div>
                )}
              </>
            )}

            {/* Classification metrics */}
            {isClassification && (
              <>
                {metrics.accuracy !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                    <div className="font-semibold">{(metrics.accuracy * 100).toFixed(2)}%</div>
                  </div>
                )}
                {metrics.f1 !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground">F1 Score</div>
                    <div className="font-semibold">{metrics.f1.toFixed(4)}</div>
                  </div>
                )}
                {metrics.precision !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground">Precision</div>
                    <div className="font-semibold">{metrics.precision.toFixed(4)}</div>
                  </div>
                )}
                {metrics.recall !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground">Recall</div>
                    <div className="font-semibold">{metrics.recall.toFixed(4)}</div>
                  </div>
                )}
              </>
            )}

            {/* Training Time */}
            {/* {metrics.training_time !== undefined && (
              <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Timer className="h-4 w-4" />
                Training Time: <span className="font-semibold">{metrics.training_time.toFixed(2)}s</span>
              </div>
            )} */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
