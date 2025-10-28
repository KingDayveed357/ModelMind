"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface TrainingSummaryProps {
  dataset: string | null
  targetColumn: string | null
  problemType: string
  selectedModel: string | null
  testSize: number
  crossValidation: boolean
  cvFolds: number
}

export function TrainingSummary({
  dataset,
  targetColumn,
  problemType,
  selectedModel,
  testSize,
  crossValidation,
  cvFolds,
}: TrainingSummaryProps) {
  const isComplete = dataset && targetColumn && problemType && (problemType === "auto" || selectedModel)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600" />
          )}
          Training Summary
        </CardTitle>
        <CardDescription>{isComplete ? "Ready to train" : "Complete the configuration"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Dataset:</span>
            <Badge variant={dataset ? "default" : "secondary"}>{dataset || "Not selected"}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Target Column:</span>
            <Badge variant={targetColumn ? "default" : "secondary"}>{targetColumn || "Not selected"}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Problem Type:</span>
            <Badge variant="default" className="capitalize">
              {problemType}
            </Badge>
          </div>

          {problemType !== "auto" && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Model:</span>
              <Badge variant={selectedModel ? "default" : "secondary"}>{selectedModel || "Not selected"}</Badge>
            </div>
          )}

          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Test Size:</span>
              <span className="font-medium">{(testSize * 100).toFixed(0)}%</span>
            </div>

            {crossValidation && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">CV Folds:</span>
                <span className="font-medium">{cvFolds}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
