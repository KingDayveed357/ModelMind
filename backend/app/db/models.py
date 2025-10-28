# app/models.py
from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


# ========================================== 
# USERS
# ==========================================
class User(BaseModel):
    """User model"""
    id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    joined_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    """Model for creating a new user"""
    full_name: str
    email: str


# ========================================== 
# DATASETS
# ==========================================
class Dataset(BaseModel):
    """Dataset model"""
    id: Optional[str] = None
    user_id: Optional[str] = None
    name: str
    file_url: str
    uploaded_at: Optional[datetime] = None
    rows: Optional[int] = None
    columns: Optional[int] = None
    feature_names: Optional[List[str]] = None
    has_missing: Optional[bool] = False
    metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class DatasetSummary(BaseModel):
    """Dataset summary for frontend display"""
    name: str
    rows: int
    columns: int
    feature_names: List[str]
    has_missing: bool
    numeric_features: Optional[List[str]] = None
    categorical_features: Optional[List[str]] = None
    warnings: Optional[List[Dict[str, Any]]] = None


class DatasetUploadResponse(BaseModel):
    """Response after uploading a dataset"""
    success: bool = True
    message: str
    dataset_id: str
    summary: DatasetSummary


# ========================================== 
# MODEL TRAINING
# ==========================================
class TrainRequest(BaseModel):
    """Request model for training a model"""
    dataset_id: str
    target_column: str
    model_type: str = Field(..., description="Type of model (e.g., 'linear_regression', 'random_forest')")
    problem_type: str = Field(default="auto", description="'regression', 'classification', or 'auto'")
    test_size: float = Field(default=0.2, ge=0.1, le=0.5)
    use_polynomial: bool = Field(default=False, description="Use polynomial features (linear models only)")
    polynomial_degree: int = Field(default=2, ge=2, le=5)
    use_target_encoder: bool = Field(default=False, description="Use target encoding for high-cardinality features")
    model_params: Optional[Dict[str, Any]] = Field(default=None, description="Model hyperparameters")

    # Legacy support for your original schema
    features: Optional[List[List[float]]] = Field(default=None, description="(Legacy) Pre-processed features")
    targets: Optional[List[float]] = Field(default=None, description="(Legacy) Target values")


class TrainResponse(BaseModel):
    """Response after training a model"""
    id: Optional[str] = None
    model_type: str
    problem_type: Optional[str] = "regression"

    # Regression metrics
    r2_score: Optional[float] = None
    mse: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None

    # Classification metrics
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None

    # Model details
    coefficients: Optional[List[float]] = None
    intercept: Optional[float] = None
    feature_importances: Optional[List[float]] = None

    # Additional info
    predictions: Optional[List[float]] = None
    training_time: Optional[float] = None
    created_at: Optional[datetime] = None
    message: Optional[str] = "Model trained successfully"


class Model(BaseModel):
    """Complete model information"""
    id: str
    user_id: str
    dataset_id: str
    model_type: str
    problem_type: str
    model_url: str
    target_column: str

    # Metrics
    r2_score: Optional[float] = None
    mse: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None

    # Model details
    coefficients: Optional[List[float]] = None
    intercept: Optional[float] = None
    feature_importances: Optional[List[float]] = None

    # Metadata
    training_metadata: Optional[Dict[str, Any]] = None
    training_time: Optional[float] = None

    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None

    status: Optional[str] = "trained"

    model_config = ConfigDict(from_attributes=True)


class ModelListResponse(BaseModel):
    """Response for listing models"""
    success: bool = True
    count: int
    models: List[Model]


# ========================================== 
# HISTORY
# ==========================================
class HistoryItem(BaseModel):
    """History item model"""
    id: Optional[str] = None
    model_id: Optional[str] = None
    user_id: Optional[str] = None
    step: str = Field(..., description="Event type: 'upload', 'training', 'prediction', 'evaluation'")
    message: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class HistoryCreate(BaseModel):
    """Model for creating history entry"""
    model_id: Optional[str] = None
    step: str
    message: str
    metadata: Optional[Dict[str, Any]] = None


class HistoryListResponse(BaseModel):
    """Response for listing history"""
    success: bool = True
    count: int
    history: List[HistoryItem]


# ========================================== 
# PREDICTION
# ==========================================
class PredictionRequest(BaseModel):
    """Request model for making predictions"""
    model_id: str
    input_data: List[Dict[str, Any]] = Field(..., description="List of feature dictionaries")
    return_probabilities: bool = Field(default=False, description="Return class probabilities (classification only)")
    save_predictions: bool = Field(default=True, description="Save predictions to database")

    # Legacy support
    features: Optional[List[List[float]]] = Field(default=None, description="(Legacy) Pre-processed features")


class PredictionResponse(BaseModel):
    """Response after making predictions"""
    success: bool = True
    message: Optional[str] = "Predictions generated successfully"
    model_id: str
    model_type: str
    problem_type: str
    predictions: List[float]
    n_samples: int
    probabilities: Optional[List[List[float]]] = None
    predictions_with_confidence: Optional[List[Dict[str, Any]]] = None


class PredictionRecord(BaseModel):
    """Stored prediction record"""
    id: Optional[str] = None
    model_id: str
    user_id: str
    predictions: List[float]
    probabilities: Optional[List[List[float]]] = None
    features: Optional[List[Dict[str, Any]]] = None
    n_samples: int
    predicted_at: Optional[datetime] = None
    source_file: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PredictionHistoryResponse(BaseModel):
    """Response for prediction history"""
    success: bool = True
    count: int
    predictions: List[PredictionRecord]


# ========================================== 
# EVALUATION
# ==========================================
class EvaluationMetrics(BaseModel):
    """Model evaluation metrics"""
    # Regression metrics
    r2_score: Optional[float] = None
    adjusted_r2: Optional[float] = None
    mse: Optional[float] = None
    rmse: Optional[float] = None
    mae: Optional[float] = None
    mape: Optional[float] = None

    # Classification metrics
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    roc_auc: Optional[float] = None
    confusion_matrix: Optional[List[List[int]]] = None
    classification_report: Optional[Dict[str, Any]] = None


class EvaluationSummary(BaseModel):
    """Evaluation summary"""
    performance: str = Field(..., description="Performance level: Excellent, Good, Moderate, Fair, Poor")
    key_metrics: Dict[str, str]
    interpretation: str


class Evaluation(BaseModel):
    """Model evaluation record"""
    id: Optional[str] = None
    model_id: str
    user_id: str
    metrics: EvaluationMetrics
    summary: Optional[EvaluationSummary] = None
    evaluated_at: Optional[datetime] = None
    test_samples: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EvaluationResponse(BaseModel):
    """Response after evaluating a model"""
    success: bool = True
    message: str
    evaluation_id: str
    metrics: EvaluationMetrics
    summary: EvaluationSummary
    predictions_sample: Optional[Dict[str, List[float]]] = None


class CompareModelsRequest(BaseModel):
    """Request for comparing multiple models"""
    model_ids: List[str] = Field(..., min_length=2, max_length=10)


class CompareModelsResponse(BaseModel):
    """Response for model comparison"""
    success: bool = True
    n_models: int
    rankings: List[Dict[str, Any]]


# ========================================== 
# EXPLAIN / AI ASSISTANT
# ==========================================
class ExplainRequest(BaseModel):
    """Request for AI explanation of results"""
    r2_score: Optional[float] = None
    mse: Optional[float] = None
    mae: Optional[float] = None
    accuracy: Optional[float] = None
    model_type: str
    problem_type: Optional[str] = "regression"


class ExplainResponse(BaseModel):
    """Response with AI explanation"""
    input: Dict[str, Any]
    response: str
    recommendations: Optional[List[str]] = None


# ========================================== 
# UTILITY MODELS
# ==========================================
class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    service: str = "ML API"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AvailableModels(BaseModel):
    """Available model types"""
    success: bool = True
    regression_models: List[str]
    classification_models: List[str]


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ========================================== 
# FILE UPLOAD
# ==========================================
class FileUploadResponse(BaseModel):
    """Response for file upload"""
    success: bool = True
    message: str
    file_url: str
    filename: str


class BatchPredictionRequest(BaseModel):
    """Request for batch predictions from file"""
    model_id: str
    return_probabilities: bool = False
    batch_size: int = Field(default=1000, ge=100, le=10000)


class BatchPredictionResponse(BaseModel):
    """Response for batch predictions"""
    success: bool = True
    message: str
    model_id: str
    source_file: str
    predictions: List[float]
    n_samples: int
    n_batches: int
    model_type: str
    problem_type: str
    probabilities: Optional[List[List[float]]] = None