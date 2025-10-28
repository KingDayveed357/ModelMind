// lib/services/training-service.ts
import { apiRequest } from '../api-client'

export interface Dataset {
  id: string
  name: string
  file_url: string
  rows: number
  columns: number
  has_missing: boolean
  metadata: {
    feature_names: string[]
    numeric_features: string[]
    categorical_features: string[]
    warnings?: any[]
  }
  uploaded_at: string
}

export interface TargetAnalysis {
  target_column: string
  recommended_problem_type: "regression" | "classification"
  statistics: {
    n_samples: number
    n_unique: number
    unique_ratio: number
    is_numeric: boolean
    has_floats: boolean
    dtype: string
    sample_values: any[]
  }
  warnings: Array<{
    type: "info" | "warning" | "error"
    message: string
  }>
  recommendations: {
    regression: boolean
    classification: boolean
    message: string
  }
}

export interface TrainingRequest {
  dataset_id: string
  target_col: string
  model_type?: string
  problem_type?: string
  test_size?: number
  use_polynomial?: boolean
  polynomial_degree?: number
  use_target_encoder?: boolean
}

export interface TrainingResponse {
  status: string
  message: string
  data: {
    id: string
    training_time: number
    metrics: {
      r2_score?: number
      mse?: number
      mae?: number
      rmse?: number
      accuracy?: number
      precision?: number
      recall?: number
      f1_score?: number
    }
    preprocessing_metadata: {
      problem_type: string
      train_samples: number
      test_samples: number
      n_processed_features: number
    }
  }
}

export const trainingService = {
  async getDatasets(): Promise<Dataset[]> {
    return apiRequest<Dataset[]>('/datasets/', {
      method: 'GET',
    })
  },

  async analyzeTarget(datasetId: string, targetColumn: string): Promise<TargetAnalysis> {
    return apiRequest<{ status: string; data: TargetAnalysis }>(
      `/train/${datasetId}/analyze-target?target_col=${encodeURIComponent(targetColumn)}`,
      { method: 'GET' }
    ).then(res => res.data)
  },
  
  async trainModel(request: TrainingRequest): Promise<TrainingResponse> {
    const { dataset_id, ...params } = request
        
    // Build query string
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    return apiRequest<TrainingResponse>(
      `/train/${dataset_id}?${queryParams.toString()}`,
      {
        method: 'POST',
      }
    )
  },
}