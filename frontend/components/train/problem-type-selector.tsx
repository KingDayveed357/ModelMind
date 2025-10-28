"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Brain, TrendingUp, BarChart3 } from "lucide-react"

interface ProblemTypeSelectorProps {
  problemType: "regression" | "classification" | "auto"
  onProblemTypeChange: (value: "regression" | "classification" | "auto") => void
}

export function ProblemTypeSelector({ problemType, onProblemTypeChange }: ProblemTypeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Problem Type
        </CardTitle>
        <CardDescription>Select the type of machine learning problem</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={problemType} onValueChange={onProblemTypeChange}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="regression" id="regression" />
              <Label htmlFor="regression" className="flex items-center gap-2 cursor-pointer">
                <TrendingUp className="h-4 w-4" />
                <span>Regression</span>
                <span className="text-xs text-muted-foreground">(Predict continuous values)</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="classification" id="classification" />
              <Label htmlFor="classification" className="flex items-center gap-2 cursor-pointer">
                <BarChart3 className="h-4 w-4" />
                <span>Classification</span>
                <span className="text-xs text-muted-foreground">(Predict categories)</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto" className="flex items-center gap-2 cursor-pointer">
                <Brain className="h-4 w-4" />
                <span>Auto Mode</span>
                <span className="text-xs text-muted-foreground">(Let AI decide)</span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
