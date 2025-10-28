"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MODEL_REGISTRY } from "@/lib/model-registry"
import { Brain, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ModelSelectionGridProps {
  problemType: "regression" | "classification" | "auto"
  selectedModel: string | null
  onModelSelect: (model: string) => void
}

export function ModelSelectionGrid({ problemType, selectedModel, onModelSelect }: ModelSelectionGridProps) {
  if (problemType === "auto") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Auto Mode
          </CardTitle>
          <CardDescription>AI will automatically select the best model</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              In Auto Mode, the system will evaluate multiple models and select the one with the best performance on
              your dataset.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const models = MODEL_REGISTRY[problemType]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Select Model
        </CardTitle>
        <CardDescription>Choose a {problemType} model</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(models).map(([key, model]) => (
            <Button
              key={key}
              variant={selectedModel === key ? "default" : "outline"}
              className="h-auto flex-col items-start justify-start p-3 text-left"
              onClick={() => onModelSelect(key)}
            >
              <div className="font-semibold">{model.name}</div>
              <div className="text-xs opacity-75">{model.description}</div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
