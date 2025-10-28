"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DatasetSelector } from "@/components/train/dataset-selector"
import { ProblemTypeSelector } from "@/components/train/problem-type-selector"
import { ModelSelectionGrid } from "@/components/train/model-selection-grid"
import { TrainingConfig } from "@/components/train/training-config"
import { TrainingSummary } from "@/components/train/training-summary"
import { TrainingProgress } from "@/components/train/training-progress"
import { Button } from "@/components/ui/button"
import { trainingService } from "@/lib/services/training-service"
import { useToast } from "@/hooks/use-toast"
import type { TrainState, TrainingProgress as TrainingProgressType } from "@/lib/train-types"

export default function TrainPage() {
  const { toast } = useToast()
  
  const [trainState, setTrainState] = useState<TrainState>({
    dataset: null,
    targetColumn: null,
    problemType: "regression",
    selectedModel: null,
    testSize: 0.2,
    randomSeed: 42,
    crossValidation: false,
    cvFolds: 5,
  })

  const [trainingProgress, setTrainingProgress] = useState<TrainingProgressType>({
    isTraining: false,
    progress: 0,
    metrics: {},
    status: "Ready to train",
  })

  // const handleStartTraining = async () => {
  //   if (!trainState.dataset || !trainState.targetColumn) {
  //     toast({
  //       title: "Configuration incomplete",
  //       description: "Please select a dataset and target column",
  //       variant: "destructive",
  //     })
  //     return
  //   }

  //   if (trainState.problemType !== "auto" && !trainState.selectedModel) {
  //     toast({
  //       title: "Model not selected",
  //       description: "Please select a model or use Auto mode",
  //       variant: "destructive",
  //     })
  //     return
  //   }

  //   // Initialize training
  //   setTrainingProgress({
  //     isTraining: true,
  //     progress: 0,
  //     metrics: {},
  //     status: "Initializing training...",
  //   })

  //   try {
  //     // Realistic progress simulation
  //     const stages = [
  //       { progress: 10, status: "Loading dataset...", delay: 300 },
  //       { progress: 25, status: "Preprocessing data...", delay: 500 },
  //       { progress: 40, status: "Splitting train/test sets...", delay: 300 },
  //       { progress: 50, status: "Initializing model...", delay: 400 },
  //       { progress: 65, status: "Training model...", delay: 600 },
  //       { progress: 85, status: "Computing metrics...", delay: 400 },
  //       { progress: 95, status: "Saving model...", delay: 300 },
  //     ]

  //     let currentStage = 0
  //     const progressInterval = setInterval(() => {
  //       if (currentStage < stages.length) {
  //         const stage = stages[currentStage]
  //         setTrainingProgress(prev => ({
  //           ...prev,
  //           progress: stage.progress,
  //           status: stage.status,
  //         }))
  //         currentStage++
  //       }
  //     }, 500)

  //     // Make actual training request
  //     const response = await trainingService.trainModel({
  //       dataset_id: trainState.dataset,
  //       target_col: trainState.targetColumn,
  //       model_type: trainState.selectedModel || "auto",
  //       problem_type: trainState.problemType,
  //       test_size: trainState.testSize,
  //       use_polynomial: false,
  //       polynomial_degree: 2,
  //       use_target_encoder: true,
  //     })

  //     clearInterval(progressInterval)

  //     // Training completed successfully
  //     const metrics = response.data.metrics
  //     const finalMetrics: any = {}

  //     // Map backend metrics to frontend format
  //     if (metrics.r2_score !== undefined) finalMetrics.r2 = metrics.r2_score
  //     if (metrics.rmse !== undefined) finalMetrics.rmse = metrics.rmse
  //     if (metrics.mae !== undefined) finalMetrics.mae = metrics.mae
  //     if (metrics.accuracy !== undefined) finalMetrics.accuracy = metrics.accuracy
  //     if (metrics.f1_score !== undefined) finalMetrics.f1 = metrics.f1_score
  //     if (metrics.precision !== undefined) finalMetrics.precision = metrics.precision
  //     if (metrics.recall !== undefined) finalMetrics.recall = metrics.recall

  //     setTrainingProgress({
  //       isTraining: false,
  //       progress: 100,
  //       metrics: finalMetrics,
  //       status: `Training completed in ${response.data.training_time.toFixed(2)}s!`,
  //     })

  //     toast({
  //       title: "Training completed!",
  //       description: `Model trained successfully on ${response.data.preprocessing_metadata.train_samples} samples`,
  //     })

  //   } catch (error) {
  //     setTrainingProgress({
  //       isTraining: false,
  //       progress: 0,
  //       metrics: {},
  //       status: "Training failed",
  //     })

  //     toast({
  //       title: "Training failed",
  //       description: error instanceof Error ? error.message : "An unexpected error occurred",
  //       variant: "destructive",
  //     })
  //   }
  // }


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
      { progress: 65, status: "Initializing model...", delay: 400 },
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

    toast({
      title: "Training completed!",
      description: `Model trained successfully using ${response.data.preprocessing_metadata.problem_type}`,
    })

  } catch (error: any) {
    setTrainingProgress({
      isTraining: false,
      progress: 0,
      metrics: {},
      status: "Training failed",
    })

    // Extract more detailed error message
    const errorMessage = error?.response?.data?.detail || error?.message || "An unexpected error occurred"

    toast({
      title: "Training failed",
      description: errorMessage,
      variant: "destructive",
    })
  }
}


  const isReadyToTrain =
    trainState.dataset &&
    trainState.targetColumn &&
    trainState.problemType &&
    (trainState.problemType === "auto" || trainState.selectedModel)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Train Model</h1>
          <p className="text-muted-foreground mt-2">Configure and train your machine learning model</p>
        </div>

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
                // Auto-update problem type based on recommendation
                setTrainState((prev) => ({ ...prev, problemType: type }))
              }}
/>

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

            <Button
              onClick={handleStartTraining}
              disabled={!isReadyToTrain || trainingProgress.isTraining}
              size="lg"
              className="w-full"
            >
              {trainingProgress.isTraining ? "Training..." : "Start Training"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}