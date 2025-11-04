// lib/services/prediction-service.ts
import { apiRequest } from '@/lib/api-client'

export interface PredictionInput {
  [key: string]: number | string | boolean
}

export interface SinglePredictionResponse {
  status: string
  data: {
    predictions: number[]
    probabilities?: number[][]
    predictions_with_confidence?: Array<{
      prediction: number
      confidence: number
      all_probabilities: Record<string, number>
    }>
    model_type: string
    problem_type: string
  }
}

export interface BatchPredictionResponse {
  status: string
  data: {
    predictions: number[]
    n_samples: number
    source_file: string
    probabilities?: number[][]
  }
}

export interface ModelForPrediction {
  id: string
  model_name: string
  model_type: string
  problem_type: string
  target_column: string
  feature_columns: string[]
  metrics: Record<string, number>
}

class PredictionService {
  async getModelForPrediction(modelId: string): Promise<ModelForPrediction> {
    const response = await apiRequest<{ status: string; data: ModelForPrediction }>(
      `/predict/models/${modelId}/for-prediction`
    )
    return response.data
  }

  async makeSinglePrediction(
    modelId: string,
    inputData: PredictionInput
  ): Promise<SinglePredictionResponse> {
    return apiRequest<SinglePredictionResponse>(`/predict/${modelId}/single`, {
      method: 'POST',
      body: JSON.stringify(inputData),
    })
  }

  async makeBatchPrediction(
    modelId: string,
    file: File
  ): Promise<BatchPredictionResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return apiRequest<BatchPredictionResponse>(`/predict/${modelId}/batch`, {
      method: 'POST',
      body: formData,
    })
  }
}

export const predictionService = new PredictionService()