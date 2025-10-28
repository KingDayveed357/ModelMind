"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"

interface TrainingConfigProps {
  testSize: number
  randomSeed: number
  crossValidation: boolean
  cvFolds: number
  onTestSizeChange: (value: number) => void
  onRandomSeedChange: (value: number) => void
  onCrossValidationChange: (value: boolean) => void
  onCvFoldsChange: (value: number) => void
}

export function TrainingConfig({
  testSize,
  randomSeed,
  crossValidation,
  cvFolds,
  onTestSizeChange,
  onRandomSeedChange,
  onCrossValidationChange,
  onCvFoldsChange,
}: TrainingConfigProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Training Configuration
        </CardTitle>
        <CardDescription>Configure training parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Test Size: {(testSize * 100).toFixed(0)}%</Label>
          </div>
          <Slider
            value={[testSize]}
            onValueChange={(value) => onTestSizeChange(value[0])}
            min={0.1}
            max={0.5}
            step={0.05}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seed">Random Seed</Label>
          <Input
            id="seed"
            type="number"
            value={randomSeed}
            onChange={(e) => onRandomSeedChange(Number.parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="cv">Cross-Validation</Label>
            <Switch id="cv" checked={crossValidation} onCheckedChange={onCrossValidationChange} />
          </div>

          {crossValidation && (
            <div className="space-y-2">
              <Label htmlFor="folds">Number of Folds: {cvFolds}</Label>
              <Slider
                value={[cvFolds]}
                onValueChange={(value) => onCvFoldsChange(value[0])}
                min={2}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
