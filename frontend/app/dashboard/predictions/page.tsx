"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Calculator, Download } from "lucide-react"

export default function PredictionsPage() {
  const [selectedModel, setSelectedModel] = useState("")
  const [inputs, setInputs] = useState({
    squareFeet: "",
    bedrooms: "",
    bathrooms: "",
    locationScore: "",
  })
  const [prediction, setPrediction] = useState<number | null>(null)
  const [predicting, setPredicting] = useState(false)

  const handlePredict = () => {
    setPredicting(true)
    // Simulate prediction
    setTimeout(() => {
      const result = Math.random() * 100 + 50
      setPrediction(result)
      setPredicting(false)
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handleExportPrediction = () => {
    const data = {
      model: selectedModel,
      inputs,
      prediction,
      timestamp: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prediction-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-serif font-normal">Make Predictions</h1>
            <p className="text-muted-foreground">Enter feature values to generate predictions</p>
          </div>
          {prediction !== null && (
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExportPrediction}>
              <Download className="w-4 h-4" />
              Export Result
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Model</CardTitle>
                <CardDescription>Choose a trained model for predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trained model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="housing">Housing Price Prediction</SelectItem>
                    <SelectItem value="sales">Sales Forecast Q4</SelectItem>
                    <SelectItem value="stock">Stock Market Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Input Features</CardTitle>
                <CardDescription>Enter the values for your independent variables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="squareFeet">Square Footage</Label>
                    <Input
                      id="squareFeet"
                      type="number"
                      placeholder="e.g., 1500"
                      value={inputs.squareFeet}
                      onChange={(e) => handleInputChange("squareFeet", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Number of Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      placeholder="e.g., 3"
                      value={inputs.bedrooms}
                      onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Number of Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      placeholder="e.g., 2"
                      value={inputs.bathrooms}
                      onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationScore">Location Score (1-10)</Label>
                    <Input
                      id="locationScore"
                      type="number"
                      placeholder="e.g., 8"
                      value={inputs.locationScore}
                      onChange={(e) => handleInputChange("locationScore", e.target.value)}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <Button
                  className="w-full gap-2 mt-4"
                  onClick={handlePredict}
                  disabled={
                    !selectedModel ||
                    !inputs.squareFeet ||
                    !inputs.bedrooms ||
                    !inputs.bathrooms ||
                    !inputs.locationScore ||
                    predicting
                  }
                >
                  {predicting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" />
                      Generate Prediction
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Prediction Result */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prediction Result</CardTitle>
              </CardHeader>
              <CardContent>
                {prediction !== null ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Predicted Price</p>
                        <p className="text-2xl font-bold">${prediction.toFixed(2)}K</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lower Bound</span>
                        <span className="font-medium">${(prediction * 0.9).toFixed(2)}K</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Upper Bound</span>
                        <span className="font-medium">${(prediction * 1.1).toFixed(2)}K</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full bg-transparent" onClick={() => setPrediction(null)}>
                      New Prediction
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Calculator className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select a model and enter feature values to see predictions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
            <CardDescription>Your last 5 predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Prediction #{i}</p>
                      <p className="text-xs text-muted-foreground">2 hours ago • Housing Price Model</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-11 sm:pl-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold">${(Math.random() * 100 + 50).toFixed(2)}K</p>
                      <p className="text-xs text-muted-foreground">87% confidence</p>
                    </div>
                    <Button variant="ghost" size="sm" className="bg-transparent">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
