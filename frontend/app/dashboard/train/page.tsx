"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DatasetSelector } from "@/components/train/dataset-selector"
import { ProblemTypeSelector } from "@/components/train/problem-type-selector"
import { ModelSelectionGrid } from "@/components/train/model-selection-grid"
import { TrainingConfig } from "@/components/train/training-config"
import { TrainingSummary } from "@/components/train/training-summary"
import { TrainingProgress } from "@/components/train/training-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trainingService } from "@/lib/services/training-service"
import { useToast } from "@/hooks/use-toast"
import type { TrainState, TrainingProgress as TrainingProgressType } from "@/lib/train-types"
import { Loader2, CheckCircle2, XCircle, Eye, Sparkles, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TrainPage() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [trainState, setTrainState] = useState<TrainState>({
    dataset: null,
    targetColumn: null,
    problemType: "regression",
    selectedModel: null,
    testSize: 0.2,
    randomSeed: 42,
    crossValidation: false,
    cvFolds: 5,
    modelName: "",
    autoGenerateName: true,
  })

  const [trainingProgress, setTrainingProgress] = useState<TrainingProgressType>({
    isTraining: false,
    progress: 0,
    metrics: {},
    status: "Ready to train",
  })

  const [trainingResult, setTrainingResult] = useState<{
    modelId: string
    modelName: string
    autoSelectedModel?: string
    autoSelectionReason?: string
  } | null>(null)

  const [nameValidation, setNameValidation] = useState<{
    checking: boolean
    exists: boolean | null
    message: string
  }>({
    checking: false,
    exists: null,
    message: ""
  })

  // Debounced name validation
  useEffect(() => {
    if (trainState.autoGenerateName || !trainState.modelName?.trim()) {
      setNameValidation({ checking: false, exists: null, message: "" })
      return
    }

    const timeoutId = setTimeout(async () => {
      setNameValidation({ checking: true, exists: null, message: "" })
      
      try {
        const result = await trainingService.checkModelName(trainState.modelName!)
        setNameValidation({
          checking: false,
          exists: result.exists,
          message: result.message
        })
      } catch (error) {
        setNameValidation({
          checking: false,
          exists: null,
          message: "Failed to check name availability"
        })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [trainState.modelName, trainState.autoGenerateName])

  const handleStartTraining = async () => {
    if (!trainState.dataset || !trainState.targetColumn) {
      toast({
        title: "Configuration incomplete",
        description: "Please select a dataset and target column",
        variant: "destructive",
      })
      return
    }

    if (trainState.problemType !== "auto" && !trainState.selectedModel) {
      toast({
        title: "Model not selected",
        description: "Please select a model or use Auto mode",
        variant: "destructive",
      })
      return
    }

    if (!trainState.autoGenerateName && !trainState.modelName?.trim()) {
      toast({
        title: "Model name required",
        description: "Please enter a model name or enable auto-generation",
        variant: "destructive",
      })
      return
    }

    if (!trainState.autoGenerateName && nameValidation.exists) {
      toast({
        title: "Duplicate model name",
        description: "This model name already exists. Choose a different name or enable auto-generation.",
        variant: "destructive",
      })
      return
    }

    // Reset previous results
    setTrainingResult(null)

    // Initialize training
    setTrainingProgress({
      isTraining: true,
      progress: 0,
      metrics: {},
      status: "Initializing training...",
    })

    try {
      // Realistic progress simulation
      const stages = [
        { progress: 10, status: "Loading dataset...", delay: 300 },
        { progress: 25, status: "Analyzing target column...", delay: 400 },
        { progress: 40, status: "Preprocessing data...", delay: 500 },
        { progress: 55, status: "Splitting train/test sets...", delay: 300 },
        { progress: 65, status: trainState.problemType === "auto" ? "Evaluating models..." : "Initializing model...", delay: 400 },
        { progress: 80, status: "Training model...", delay: 600 },
        { progress: 90, status: "Computing metrics...", delay: 400 },
        { progress: 95, status: "Saving model...", delay: 300 },
      ]

      let currentStage = 0
      const progressInterval = setInterval(() => {
        if (currentStage < stages.length) {
          const stage = stages[currentStage]
          setTrainingProgress(prev => ({
            ...prev,
            progress: stage.progress,
            status: stage.status,
          }))
          currentStage++
        }
      }, 500)

      // Make actual training request
      const response = await trainingService.trainModel({
        dataset_id: trainState.dataset,
        target_col: trainState.targetColumn,
        model_type: trainState.selectedModel || "auto",
        problem_type: trainState.problemType,
        test_size: trainState.testSize,
        use_polynomial: false,
        polynomial_degree: 2,
        use_target_encoder: true,
        model_name: trainState.autoGenerateName ? undefined : trainState.modelName?.trim(),
        auto_generate_name: trainState.autoGenerateName,
      })

      clearInterval(progressInterval)

      // Training completed successfully
      const metrics = response.data.metrics
      const finalMetrics: any = {}

      // Map backend metrics to frontend format
      if (metrics.r2_score !== undefined) finalMetrics.r2 = metrics.r2_score
      if (metrics.rmse !== undefined) finalMetrics.rmse = metrics.rmse
      if (metrics.mae !== undefined) finalMetrics.mae = metrics.mae
      if (metrics.accuracy !== undefined) finalMetrics.accuracy = metrics.accuracy
      if (metrics.f1_score !== undefined) finalMetrics.f1 = metrics.f1_score
      if (metrics.precision !== undefined) finalMetrics.precision = metrics.precision
      if (metrics.recall !== undefined) finalMetrics.recall = metrics.recall

      setTrainingProgress({
        isTraining: false,
        progress: 100,
        metrics: finalMetrics,
        status: `Training completed in ${response.data.training_time.toFixed(2)}s!`,
      })

      // Store training result with auto-selection info
      const autoSelectedModel = trainState.problemType === "auto" || trainState.selectedModel === "auto" 
        ? response.data.model_type || response.data.model_name?.split('_')[0] || undefined
        : undefined

      setTrainingResult({
        modelId: response.data.id,
        modelName: response.data.model_name,
        autoSelectedModel: autoSelectedModel,
        autoSelectionReason: autoSelectedModel ? generateAutoSelectionReason(autoSelectedModel, metrics, response.data.preprocessing_metadata.problem_type) : undefined
      })

      toast({
        title: "Training completed!",
        description: `Model "${response.data.model_name}" trained successfully${autoSelectedModel ? ` using ${autoSelectedModel}` : ''}`,
      })

    } catch (error: any) {
      setTrainingProgress({
        isTraining: false,
        progress: 0,
        metrics: {},
        status: "Training failed",
      })

      const errorMessage = error?.response?.data?.detail || error?.message || "An unexpected error occurred"

      toast({
        title: "Training failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const generateAutoSelectionReason = (modelType: string, metrics: any, problemType: string): string => {
    const modelNames: Record<string, string> = {
      'lgbm': 'LightGBM',
      'xgboost': 'XGBoost',
      'rf': 'Random Forest',
      'random_forest': 'Random Forest',
      'gradient_boosting': 'Gradient Boosting',
      'linear_regression': 'Linear Regression',
      'logistic_regression': 'Logistic Regression',
    }

    const displayName = modelNames[modelType.toLowerCase()] || modelType

    if (problemType === 'regression') {
      const r2 = metrics.r2_score || 0
      const rmse = metrics.rmse || 0
      
      if (r2 > 0.9) {
        return `${displayName} achieved exceptional performance with R² = ${r2.toFixed(3)}, explaining over 90% of variance in your data.`
      } else if (r2 > 0.7) {
        return `${displayName} provided the best balance of accuracy (R² = ${r2.toFixed(3)}) and training efficiency for your dataset.`
      } else {
        return `${displayName} was selected as the optimal model with R² = ${r2.toFixed(3)} and RMSE = ${rmse.toFixed(3)}.`
      }
    } else {
      const accuracy = metrics.accuracy || 0
      const f1 = metrics.f1_score || 0
      
      if (accuracy > 0.95) {
        return `${displayName} achieved outstanding classification performance with ${(accuracy * 100).toFixed(1)}% accuracy.`
      } else if (f1 > 0.85) {
        return `${displayName} provided excellent balance between precision and recall (F1 = ${f1.toFixed(3)}) for your classification task.`
      } else {
        return `${displayName} was selected as the best performer with ${(accuracy * 100).toFixed(1)}% accuracy and F1 score of ${f1.toFixed(3)}.`
      }
    }
  }

  const handleViewModel = () => {
    if (trainingResult?.modelId) {
      router.push(`/dashboard/models/${trainingResult.modelId}`)
    }
  }

  const handleTrainAnother = () => {
    setTrainingResult(null)
    setTrainingProgress({
      isTraining: false,
      progress: 0,
      metrics: {},
      status: "Ready to train",
    })
  }

  const isReadyToTrain =
    trainState.dataset &&
    trainState.targetColumn &&
    trainState.problemType &&
    (trainState.problemType === "auto" || trainState.selectedModel) &&
    (trainState.autoGenerateName || (trainState.modelName?.trim() && !nameValidation.exists))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Train Model</h1>
          <p className="text-muted-foreground mt-2">Configure and train your machine learning model</p>
        </div>

        {/* Auto-selection success banner */}
        {trainingResult?.autoSelectedModel && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              Auto-Selection: {trainingResult.autoSelectedModel}
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              {trainingResult.autoSelectionReason}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <DatasetSelector
              dataset={trainState.dataset}
              targetColumn={trainState.targetColumn}
              problemType={trainState.problemType as "regression" | "classification" | "auto"}
              onDatasetChange={(value) => {
                setTrainState((prev) => ({ 
                  ...prev, 
                  dataset: value,
                  targetColumn: null
                }))
              }}
              onTargetChange={(value) => setTrainState((prev) => ({ ...prev, targetColumn: value }))}
              onProblemTypeRecommendation={(type) => {
                setTrainState((prev) => ({ ...prev, problemType: type }))
              }}
            />

            <div className="space-y-4 border rounded-lg p-6">
              <div className="space-y-2">
                <Label htmlFor="model-name" className="text-base font-medium">
                  Model Name
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose a unique name for your model or let the system generate one
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-generate"
                  checked={trainState.autoGenerateName}
                  onCheckedChange={(checked) =>
                    setTrainState((prev) => ({ 
                      ...prev, 
                      autoGenerateName: checked as boolean,
                      modelName: checked ? "" : prev.modelName
                    }))
                  }
                />
                <label
                  htmlFor="auto-generate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Auto-generate unique name
                </label>
              </div>

              {!trainState.autoGenerateName && (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="model-name"
                      placeholder="Enter model name (e.g. sales_predictor_v1)"
                      value={trainState.modelName || ""}
                      onChange={(e) =>
                        setTrainState((prev) => ({ ...prev, modelName: e.target.value }))
                      }
                      className={
                        nameValidation.exists === true
                          ? "border-red-500 focus-visible:ring-red-500"
                          : nameValidation.exists === false
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }
                      disabled={trainState.autoGenerateName}
                    />
                    {nameValidation.checking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {!nameValidation.checking && nameValidation.exists === true && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                    {!nameValidation.checking && nameValidation.exists === false && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  {nameValidation.message && (
                    <p
                      className={`text-sm ${
                        nameValidation.exists ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {nameValidation.message}
                    </p>
                  )}
                </div>
              )}

              {trainState.autoGenerateName && (
                <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground">
                  <p>
                    The system will automatically generate a unique name based on your model type and target
                    column (e.g., random_forest_sales_20241029_143022)
                  </p>
                </div>
              )}
            </div>

            <ProblemTypeSelector
              problemType={trainState.problemType as "regression" | "classification" | "auto"}
              onProblemTypeChange={(value) =>
                setTrainState((prev) => ({
                  ...prev,
                  problemType: value,
                  selectedModel: null,
                }))
              }
            />

            <ModelSelectionGrid
              problemType={trainState.problemType as "regression" | "classification" | "auto"}
              selectedModel={trainState.selectedModel}
              onModelSelect={(model) => setTrainState((prev) => ({ ...prev, selectedModel: model }))}
            />

            <TrainingConfig
              testSize={trainState.testSize}
              randomSeed={trainState.randomSeed}
              crossValidation={trainState.crossValidation}
              cvFolds={trainState.cvFolds}
              onTestSizeChange={(value) => setTrainState((prev) => ({ ...prev, testSize: value }))}
              onRandomSeedChange={(value) => setTrainState((prev) => ({ ...prev, randomSeed: value }))}
              onCrossValidationChange={(value) => setTrainState((prev) => ({ ...prev, crossValidation: value }))}
              onCvFoldsChange={(value) => setTrainState((prev) => ({ ...prev, cvFolds: value }))}
            />
          </div>

          {/* Right Column - Summary & Progress */}
          <div className="space-y-6">
            <TrainingSummary
              dataset={trainState.dataset}
              targetColumn={trainState.targetColumn}
              problemType={trainState.problemType}
              selectedModel={trainState.selectedModel}
              testSize={trainState.testSize}
              crossValidation={trainState.crossValidation}
              cvFolds={trainState.cvFolds}
            />

            <TrainingProgress
              isTraining={trainingProgress.isTraining}
              progress={trainingProgress.progress}
              metrics={trainingProgress.metrics}
              status={trainingProgress.status}
            />

            {/* Training Complete - Action Buttons */}
            {trainingResult && trainingProgress.progress === 100 && (
              <Card className="border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Training Complete!
                  </CardTitle>
                  <CardDescription>
                    Model "{trainingResult.modelName}" is ready to use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleViewModel}
                    size="lg"
                    className="w-full"
                    variant="default"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Model Details
                  </Button>
                  <Button
                    onClick={handleTrainAnother}
                    size="lg"
                    className="w-full"
                    variant="outline"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Train Another Model
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Start Training Button */}
            {!trainingResult && (
              <>
                <Button
                  onClick={handleStartTraining}
                  disabled={!isReadyToTrain || trainingProgress.isTraining}
                  size="lg"
                  className="w-full"
                >
                  {trainingProgress.isTraining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Training...
                    </>
                  ) : (
                    "Start Training"
                  )}
                </Button>

                {!isReadyToTrain && !trainingProgress.isTraining && (
                  <div className="text-sm text-muted-foreground text-center space-y-1">
                    {!trainState.dataset && <p>• Select a dataset</p>}
                    {!trainState.targetColumn && <p>• Choose a target column</p>}
                    {trainState.problemType !== "auto" && !trainState.selectedModel && (
                      <p>• Select a model or use Auto mode</p>
                    )}
                    {!trainState.autoGenerateName && !trainState.modelName?.trim() && (
                      <p>• Enter a model name or enable auto-generation</p>
                    )}
                    {!trainState.autoGenerateName && nameValidation.exists && (
                      <p>• Choose a unique model name</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}