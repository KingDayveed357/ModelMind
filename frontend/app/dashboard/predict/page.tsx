// app/dashboard/predict/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { predictionService, type ModelForPrediction, type PredictionInput } from "@/lib/services/prediction-service"
import { modelService } from "@/lib/services/model-service"
import { TrendingUp, Calculator, Download, Upload, FileUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function PredictionsPage() {
  const searchParams = useSearchParams()
  const preSelectedModelId = searchParams.get("model")
  const { toast } = useToast()

  const [models, setModels] = useState<any[]>([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [selectedModelId, setSelectedModelId] = useState(preSelectedModelId || "")
  const [selectedModel, setSelectedModel] = useState<ModelForPrediction | null>(null)
  const [loadingModelDetails, setLoadingModelDetails] = useState(false)
  
  // Single prediction state
  const [inputs, setInputs] = useState<PredictionInput>({})
  const [prediction, setPrediction] = useState<any>(null)
  const [predicting, setPredicting] = useState(false)

  // Batch prediction state
  const [file, setFile] = useState<File | null>(null)
  const [batchPrediction, setBatchPrediction] = useState<any>(null)
  const [batchPredicting, setBatchPredicting] = useState(false)

  const [activeTab, setActiveTab] = useState("single")

  useEffect(() => {
    loadModels()
  }, [])

  useEffect(() => {
    if (selectedModelId) {
      loadModelDetails()
    }
  }, [selectedModelId])

  const loadModels = async () => {
    try {
      setLoadingModels(true)
      const response = await modelService.listModels({}, {}, 1, 100)
      setModels(response.data.models)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load models",
        variant: "destructive",
      })
    } finally {
      setLoadingModels(false)
    }
  }

  const loadModelDetails = async () => {
    try {
      setLoadingModelDetails(true)
      const model = await predictionService.getModelForPrediction(selectedModelId)
      setSelectedModel(model)
      
      // Initialize input fields with empty values
      const initialInputs: PredictionInput = {}
      model.feature_columns.forEach(col => {
        initialInputs[col] = ""
      })
      setInputs(initialInputs)
      
      // Reset predictions
      setPrediction(null)
      setBatchPrediction(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load model details",
        variant: "destructive",
      })
    } finally {
      setLoadingModelDetails(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const handleSinglePredict = async () => {
    if (!selectedModel) return

    // Validate all inputs are filled
    const emptyFields = Object.entries(inputs).filter(([_, value]) => value === "")
    if (emptyFields.length > 0) {
      toast({
        title: "Missing inputs",
        description: `Please fill in all feature values: ${emptyFields.map(([key]) => key).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    try {
      setPredicting(true)
      
      // Convert inputs to appropriate types
      const processedInputs: PredictionInput = {}
      Object.entries(inputs).forEach(([key, value]) => {
        const numValue = parseFloat(value as string)
        processedInputs[key] = isNaN(numValue) ? value : numValue
      })

      const response = await predictionService.makeSinglePrediction(selectedModelId, processedInputs)
      setPrediction(response.data)
      
      toast({
        title: "Success",
        description: "Prediction generated successfully",
      })
    } catch (error) {
      toast({
        title: "Prediction failed",
        description: error instanceof Error ? error.message : "Failed to generate prediction",
        variant: "destructive",
      })
    } finally {
      setPredicting(false)
    }
  }

  const handleBatchPredict = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    try {
      setBatchPredicting(true)
      const response = await predictionService.makeBatchPrediction(selectedModelId, file)
      setBatchPrediction(response.data)
      
      toast({
        title: "Success",
        description: `Generated predictions for ${response.data.n_samples} samples`,
      })
    } catch (error) {
      toast({
        title: "Batch prediction failed",
        description: error instanceof Error ? error.message : "Failed to generate predictions",
        variant: "destructive",
      })
    } finally {
      setBatchPredicting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setBatchPrediction(null)
    }
  }

  const handleExportSingle = () => {
    if (!prediction) return

    const data = {
      model: selectedModel?.model_name,
      model_id: selectedModelId,
      inputs,
      prediction: prediction.predictions[0],
      ...(prediction.predictions_with_confidence && {
        confidence: prediction.predictions_with_confidence[0].confidence,
        probabilities: prediction.predictions_with_confidence[0].all_probabilities,
      }),
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

  const handleExportBatch = () => {
    if (!batchPrediction) return

    // Create CSV
    const headers = ["Prediction", ...(batchPrediction.probabilities ? ["Confidence"] : [])]
    const rows = batchPrediction.predictions.map((pred: number, idx: number) => {
      const row = [pred]
      if (batchPrediction.probabilities) {
        const maxProb = Math.max(...batchPrediction.probabilities[idx])
        row.push(maxProb.toFixed(4))
      }
      return row.join(",")
    })

    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `batch-predictions-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-serif font-normal">Make Predictions</h1>
          <p className="text-muted-foreground">
            Generate predictions using your trained models
          </p>
        </div>

        {/* Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Model</CardTitle>
            <CardDescription>Choose a trained model for predictions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingModels ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a trained model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.model_name} ({model.problem_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedModel && (
              <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{selectedModel.model_name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedModel.model_type} • {selectedModel.problem_type}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedModel.metrics).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}: </span>
                          <span className="font-medium">
                            {typeof value === "number" ? value.toFixed(3) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Features</p>
                    <p className="text-lg font-semibold">{selectedModel.feature_columns.length}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedModel && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Prediction</TabsTrigger>
              <TabsTrigger value="batch">Batch Prediction</TabsTrigger>
            </TabsList>

            {/* Single Prediction Tab */}
            <TabsContent value="single" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Input Features</CardTitle>
                      <CardDescription>
                        Enter values for all {selectedModel.feature_columns.length} features
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingModelDetails ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-10 w-full" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedModel.feature_columns.map(col => (
                              <div key={col} className="space-y-2">
                                <Label htmlFor={col}>{col}</Label>
                                <Input
                                  id={col}
                                  type="text"
                                  placeholder={`Enter ${col}`}
                                  value={inputs[col] || ""}
                                  onChange={e => handleInputChange(col, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>

                          <Button
                            className="w-full gap-2 mt-4"
                            onClick={handleSinglePredict}
                            disabled={predicting}
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
                        </div>
                      )}
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
                      {prediction ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {selectedModel.problem_type === "regression" ? "Predicted Value" : "Predicted Class"}
                              </p>
                              <p className="text-2xl font-bold">
                                {prediction.predictions[0].toFixed(selectedModel.problem_type === "regression" ? 2 : 0)}
                              </p>
                            </div>
                          </div>

                          {prediction.predictions_with_confidence && (
                            <div className="pt-4 border-t border-border space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Confidence</span>
                                <span className="font-medium">
                                  {(prediction.predictions_with_confidence[0].confidence * 100).toFixed(1)}%
                                </span>
                              </div>

                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Class Probabilities:</p>
                                {Object.entries(prediction.predictions_with_confidence[0].all_probabilities).map(([cls, prob]: [string, any]) => (
                                  <div key={cls} className="flex justify-between text-xs">
                                    <span>Class {cls}</span>
                                    <span className="font-medium">{(prob * 100).toFixed(1)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 bg-transparent" 
                              onClick={() => setPrediction(null)}
                            >
                              New Prediction
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-transparent"
                              onClick={handleExportSingle}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Calculator className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Enter feature values and click "Generate Prediction" to see results
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Batch Prediction Tab */}
            <TabsContent value="batch" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload CSV File</CardTitle>
                      <CardDescription>
                        Upload a CSV file with {selectedModel.feature_columns.length} columns matching your model's features
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <input
                          type="file"
                          id="file-upload"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center gap-3"
                        >
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileUp className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Click to upload CSV file</p>
                            <p className="text-sm text-muted-foreground">or drag and drop</p>
                          </div>
                        </label>
                      </div>

                      {file && (
                        <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm font-medium mb-2">Required columns:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedModel.feature_columns.map(col => (
                            <code key={col} className="text-xs bg-background px-2 py-1 rounded">
                              {col}
                            </code>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full gap-2"
                        onClick={handleBatchPredict}
                        disabled={!file || batchPredicting}
                      >
                        {batchPredicting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Generate Predictions
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Batch Results */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Batch Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {batchPrediction ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Predictions Generated</p>
                              <p className="text-2xl font-bold">{batchPrediction.n_samples}</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-border space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Source File</span>
                              <span className="font-medium text-xs">{batchPrediction.source_file}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Model Type</span>
                              <span className="font-medium">{selectedModel.problem_type}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Sample predictions:</p>
                            <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                              {batchPrediction.predictions.slice(0, 5).map((pred: number, idx: number) => (
                                <div key={idx} className="flex justify-between text-xs">
                                  <span>Row {idx + 1}</span>
                                  <span className="font-mono font-medium">{pred.toFixed(2)}</span>
                                </div>
                              ))}
                              {batchPrediction.predictions.length > 5 && (
                                <p className="text-xs text-muted-foreground text-center pt-1">
                                  ... and {batchPrediction.predictions.length - 5} more
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full gap-2 bg-transparent"
                            onClick={handleExportBatch}
                          >
                            <Download className="w-4 h-4" />
                            Export as CSV
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Upload a CSV file to generate batch predictions
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}





// OLD CODE --- IGNORE ---
// "use client"

// import { useState } from "react"
// import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { TrendingUp, Calculator, Download } from "lucide-react"

// export default function PredictionsPage() {
//   const [selectedModel, setSelectedModel] = useState("")
//   const [inputs, setInputs] = useState({
//     squareFeet: "",
//     bedrooms: "",
//     bathrooms: "",
//     locationScore: "",
//   })
//   const [prediction, setPrediction] = useState<number | null>(null)
//   const [predicting, setPredicting] = useState(false)

//   const handlePredict = () => {
//     setPredicting(true)
//     // Simulate prediction
//     setTimeout(() => {
//       const result = Math.random() * 100 + 50
//       setPrediction(result)
//       setPredicting(false)
//     }, 1000)
//   }

//   const handleInputChange = (field: string, value: string) => {
//     setInputs((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleExportPrediction = () => {
//     const data = {
//       model: selectedModel,
//       inputs,
//       prediction,
//       timestamp: new Date().toISOString(),
//     }
//     const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `prediction-${Date.now()}.json`
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   return (
//     <DashboardLayout>
//       <div className="flex flex-col gap-8 max-w-6xl">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
//           <div className="flex flex-col gap-2">
//             <h1 className="text-3xl font-serif font-normal">Make Predictions</h1>
//             <p className="text-muted-foreground">Enter feature values to generate predictions</p>
//           </div>
//           {prediction !== null && (
//             <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExportPrediction}>
//               <Download className="w-4 h-4" />
//               Export Result
//             </Button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Input Form */}
//           <div className="lg:col-span-2 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Select Model</CardTitle>
//                 <CardDescription>Choose a trained model for predictions</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Select value={selectedModel} onValueChange={setSelectedModel}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a trained model" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="housing">Housing Price Prediction</SelectItem>
//                     <SelectItem value="sales">Sales Forecast Q4</SelectItem>
//                     <SelectItem value="stock">Stock Market Analysis</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Input Features</CardTitle>
//                 <CardDescription>Enter the values for your independent variables</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="squareFeet">Square Footage</Label>
//                     <Input
//                       id="squareFeet"
//                       type="number"
//                       placeholder="e.g., 1500"
//                       value={inputs.squareFeet}
//                       onChange={(e) => handleInputChange("squareFeet", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="bedrooms">Number of Bedrooms</Label>
//                     <Input
//                       id="bedrooms"
//                       type="number"
//                       placeholder="e.g., 3"
//                       value={inputs.bedrooms}
//                       onChange={(e) => handleInputChange("bedrooms", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="bathrooms">Number of Bathrooms</Label>
//                     <Input
//                       id="bathrooms"
//                       type="number"
//                       placeholder="e.g., 2"
//                       value={inputs.bathrooms}
//                       onChange={(e) => handleInputChange("bathrooms", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="locationScore">Location Score (1-10)</Label>
//                     <Input
//                       id="locationScore"
//                       type="number"
//                       placeholder="e.g., 8"
//                       value={inputs.locationScore}
//                       onChange={(e) => handleInputChange("locationScore", e.target.value)}
//                       min="1"
//                       max="10"
//                     />
//                   </div>
//                 </div>

//                 <Button
//                   className="w-full gap-2 mt-4"
//                   onClick={handlePredict}
//                   disabled={
//                     !selectedModel ||
//                     !inputs.squareFeet ||
//                     !inputs.bedrooms ||
//                     !inputs.bathrooms ||
//                     !inputs.locationScore ||
//                     predicting
//                   }
//                 >
//                   {predicting ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
//                       Calculating...
//                     </>
//                   ) : (
//                     <>
//                       <Calculator className="w-4 h-4" />
//                       Generate Prediction
//                     </>
//                   )}
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Prediction Result */}
//           <div>
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Prediction Result</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {prediction !== null ? (
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
//                         <TrendingUp className="w-6 h-6 text-accent" />
//                       </div>
//                       <div>
//                         <p className="text-sm text-muted-foreground">Predicted Price</p>
//                         <p className="text-2xl font-bold">${prediction.toFixed(2)}K</p>
//                       </div>
//                     </div>

//                     <div className="pt-4 border-t border-border space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">Confidence</span>
//                         <span className="font-medium">87%</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">Lower Bound</span>
//                         <span className="font-medium">${(prediction * 0.9).toFixed(2)}K</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">Upper Bound</span>
//                         <span className="font-medium">${(prediction * 1.1).toFixed(2)}K</span>
//                       </div>
//                     </div>

//                     <Button variant="outline" className="w-full bg-transparent" onClick={() => setPrediction(null)}>
//                       New Prediction
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center py-8 text-center">
//                     <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
//                       <Calculator className="w-8 h-8 text-muted-foreground" />
//                     </div>
//                     <p className="text-sm text-muted-foreground">
//                       Select a model and enter feature values to see predictions
//                     </p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Recent Predictions */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Predictions</CardTitle>
//             <CardDescription>Your last 5 predictions</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {[1, 2, 3].map((i) => (
//                 <div
//                   key={i}
//                   className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
//                       <TrendingUp className="w-4 h-4 text-primary" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium">Prediction #{i}</p>
//                       <p className="text-xs text-muted-foreground">2 hours ago • Housing Price Model</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3 pl-11 sm:pl-0">
//                     <div className="text-right">
//                       <p className="text-sm font-semibold">${(Math.random() * 100 + 50).toFixed(2)}K</p>
//                       <p className="text-xs text-muted-foreground">87% confidence</p>
//                     </div>
//                     <Button variant="ghost" size="sm" className="bg-transparent">
//                       View
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   )
// }