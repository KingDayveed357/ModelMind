// lib/services/model-service.ts
import { apiRequest } from '@/lib/api-client'
import { createClient } from '@/lib/supabase'

export interface ModelMetrics {
  r2_score?: number
  rmse?: number
  mae?: number
  mse?: number
  accuracy?: number
  precision?: number
  recall?: number
  f1_score?: number
}

export interface Model {
  id: string
  user_id: string
  dataset_id: string
  model_name: string
  model_type: string
  problem_type: 'regression' | 'classification'
  model_url: string
  target_column: string
  metrics: ModelMetrics
  training_time: number
  feature_columns: string[]
  parameters: Record<string, any>
  status: string
  description?: string
  created_at: string
  updated_at?: string
  last_used_at?: string
}

export interface PredictionsData {
  actual: number[]
  predicted: number[]
  residuals: number[]
}

export interface ModelFilters {
  search?: string
  dataset_id?: string
  model_type?: string
  problem_type?: string
  min_r2?: number
  max_mae?: number
  min_accuracy?: number
  date_from?: string
  date_to?: string
}

export interface ModelSortOptions {
  sort_by?: 'created_at' | 'metrics.r2_score' | 'metrics.accuracy' | 'model_name'
  sort_order?: 'asc' | 'desc'
}

export interface ModelSummary {
  total_models: number
  avg_r2?: number
  avg_accuracy?: number
  most_used_dataset: string
  best_performing_model: Model
  regression_count: number
  classification_count: number
}

export interface ModelListResponse {
  status: string
  data: {
    models: Model[]
    total: number
    page: number
    page_size: number
    summary: ModelSummary
  }
}

export interface ModelDetailsResponse {
  status: string
  data: Model & {
    dataset_info: {
      name: string
      rows: number
      columns: number
      file_size: number
    }
    feature_importance?: Record<string, number>
    training_history?: any
    prediction_count?: number
  }
}

export interface DatasetPreview {
  headers: string[]
  rows: any[][]
  total_rows: number
  total_columns: number
  name: string
}

export interface DatasetPreviewResponse {
  status: string
  data: DatasetPreview
}

export interface RegressionAnalytics {
  has_data: boolean
  message?: string
  sample_info: {
    total_samples: number
    displayed_samples: number
    is_sampled: boolean
  }
  scatter_data: Array<{
    actual: number
    predicted: number
    residual: number
    is_outlier: boolean
  }>
  residual_distribution: Array<{
    bin_center: number
    density: number
  }>
  domain: {
    min: number
    max: number
  }
  statistics: {
    r2_score: number
    mae: number
    rmse: number
    residual_mean: number
    residual_std: number
    residual_skewness: number
    residual_kurtosis: number
    normality_p_value: number
    prediction_margin: number
    outlier_count: number
    outlier_percentage: number
  }
  interpretation: {
    r2_quality: string
    r2_message: string
    has_bias: boolean
    bias_direction: string | null
    residuals_normal: boolean
    issues: string[]
    recommendations: string[]
  }
}

export interface ClassificationAnalytics {
  has_data: boolean
  message?: string
  confusion_matrix: Array<{
    actual: string
    predicted: string
    count: number
    is_correct: boolean
  }>
  class_metrics: Array<{
    class: string
    precision: number
    recall: number
    f1_score: number
    support: number
  }>
  overall_metrics: {
    accuracy: number
    precision: number
    recall: number
    f1_score: number
    total_predictions: number
    correct_predictions: number
    n_classes: number
  }
  class_distribution: Array<{
    class: string
    count: number
    percentage: number
  }>
  top_confusions: Array<{
    actual: string
    predicted: string
    count: number
    percentage: number
  }>
  interpretation: {
    quality: string
    quality_message: string
    has_imbalance: boolean
    worst_class: string
    best_class: string
    issues: string[]
    recommendations: string[]
    balance_score: number
  }
}


class ModelService {
  private async getUserId(): Promise<string> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    return user.id
  }

  /**
   * Fetch all models with filters, search, and sorting
   */
  async listModels(
    filters?: ModelFilters,
    sort?: ModelSortOptions,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ModelListResponse> {
    const userId = await this.getUserId()
    const params = new URLSearchParams()
    
    params.append('user_id', userId)
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.dataset_id) params.append('dataset_id', filters.dataset_id)
    if (filters?.model_type) params.append('model_type', filters.model_type)
    if (filters?.problem_type) params.append('problem_type', filters.problem_type)
    if (filters?.min_r2) params.append('min_r2', filters.min_r2.toString())
    if (filters?.max_mae) params.append('max_mae', filters.max_mae.toString())
    if (filters?.min_accuracy) params.append('min_accuracy', filters.min_accuracy.toString())
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    
    if (sort?.sort_by) params.append('sort_by', sort.sort_by)
    if (sort?.sort_order) params.append('sort_order', sort.sort_order)
    
    params.append('page', page.toString())
    params.append('page_size', pageSize.toString())
    
    return apiRequest<ModelListResponse>(`/models?${params.toString()}`)
  }

  /**
   * Get detailed information about a specific model
   */
  async getModelDetails(modelId: string): Promise<ModelDetailsResponse> {
    const userId = await this.getUserId()
    return apiRequest<ModelDetailsResponse>(`/models/${modelId}?user_id=${userId}`)
  }

  /**
   * Get actual vs predicted data for visualizations
   */
  async getPredictionsData(modelId: string): Promise<{ status: string; data: PredictionsData }> {
    const userId = await this.getUserId()
    return apiRequest<{ status: string; data: PredictionsData }>(
      `/models/${modelId}/predictions-data?user_id=${userId}`
    )
  }

  /**
   * Delete a model
   */
  async deleteModel(modelId: string): Promise<{ status: string; message: string }> {
    const userId = await this.getUserId()
    return apiRequest(`/models/${modelId}?user_id=${userId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Export model as downloadable file
   */
  async exportModel(modelId: string, format: 'json' | 'pkl' = 'pkl'): Promise<Blob> {
    const userId = await this.getUserId()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/models/${modelId}/export?user_id=${userId}&format=${format}`,
      {
        method: 'GET',
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to export model')
    }
    
    return response.blob()
  }

  /**
   * Update model metadata (name, description)
   */
  async updateModel(
    modelId: string,
    updates: { model_name?: string; description?: string }
  ): Promise<{ status: string; data: Model }> {
    const userId = await this.getUserId()
    return apiRequest(`/models/${modelId}?user_id=${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  /**
   * Get model summary statistics
   */
  async getModelSummary(): Promise<{ status: string; data: ModelSummary }> {
    const userId = await this.getUserId()
    return apiRequest(`/models/summary?user_id=${userId}`)
  }

  /**
   * Get feature importance for a model
   */
  async getFeatureImportance(modelId: string): Promise<{
    status: string
    data: { features: string[]; importance: number[] }
  }> {
    const userId = await this.getUserId()
    return apiRequest(`/models/${modelId}/feature-importance?user_id=${userId}`)
  }

  /**
   * Get dataset preview for a model
   */
  async getDatasetPreview(modelId: string, rows: number = 10): Promise<DatasetPreviewResponse> {
    const userId = await this.getUserId()
    return apiRequest<DatasetPreviewResponse>(
      `/models/${modelId}/dataset-preview?user_id=${userId}&rows=${rows}`
    )
  }

  /**
   * Get model details with dataset preview included
   */
  async getModelDetailsWithPreview(modelId: string): Promise<ModelDetailsResponse & { dataset_preview?: DatasetPreview }> {
    const userId = await this.getUserId()
    
    // Get model details
    const modelDetails = await apiRequest<ModelDetailsResponse>(`/models/${modelId}?user_id=${userId}`)
    
    // Get dataset preview
    try {
      const datasetPreview = await this.getDatasetPreview(modelId, 10)
      return {
        ...modelDetails,
        dataset_preview: datasetPreview.data
      }
    } catch (error) {
      console.warn('Failed to fetch dataset preview:', error)
      return modelDetails
    }
  }


/**
 * Get comprehensive regression analytics for visualizations
 */
async getRegressionAnalytics(
  modelId: string,
  sampleSize?: number
): Promise<{ status: string; data: RegressionAnalytics }> {
  const userId = await this.getUserId()
  const params = new URLSearchParams()
  params.append('user_id', userId)
  if (sampleSize) params.append('sample_size', sampleSize.toString())
  
  return apiRequest<{ status: string; data: RegressionAnalytics }>(
    `/models/${modelId}/analytics?${params.toString()}`
  )
}

/**
 * Get comprehensive classification analytics including confusion matrix
 */
async getClassificationAnalytics(
  modelId: string
): Promise<{ status: string; data: ClassificationAnalytics }> {
  const userId = await this.getUserId()
  return apiRequest<{ status: string; data: ClassificationAnalytics }>(
    `/models/${modelId}/classification-analytics?user_id=${userId}`
  )
}


  /**
   * Get prediction history for a model
   */
  async getPredictionHistory(
    modelId: string,
    limit: number = 50
  ): Promise<{
    status: string
    data: Array<{
      id: string
      predicted_at: string
      n_samples: number
      source_file?: string
    }>
  }> {
    const userId = await this.getUserId()
    return apiRequest(`/models/${modelId}/predictions?user_id=${userId}&limit=${limit}`)
  }
}

export const modelService = new ModelService()