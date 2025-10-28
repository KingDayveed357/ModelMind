export interface TrainState {
  dataset: string | null
  targetColumn: string | null
  problemType: "regression" | "classification" | "auto"
  selectedModel: string | null
  testSize: number
  randomSeed: number
  crossValidation: boolean
  cvFolds: number
}

export interface TrainingMetrics {
  accuracy?: number
  rmse?: number
  r2?: number
  precision?: number
  recall?: number
  f1?: number
  mae?: number
}

export interface TrainingProgress {
  isTraining: boolean
  progress: number
  metrics: TrainingMetrics
  status: string
}
