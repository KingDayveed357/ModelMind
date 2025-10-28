from __future__ import annotations
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from pydantic import BaseModel

# ==========================================
# USERS
# ==========================================
class User(BaseModel):
    id: str
    full_name: Optional[str]
    email: Optional[str]
    joined_at: Optional[datetime]

# ==========================================
# DATASETS
# ==========================================
class Dataset(BaseModel):
    id: Optional[str]
    user_id: Optional[str]
    name: str
    file_url: str
    uploaded_at: Optional[datetime]

# For summaries in the frontend
class DatasetSummary(BaseModel):
    name: str
    rows: int
    columns: int
    feature_names: List[str]
    has_missing: bool

# ==========================================
# MODEL TRAINING
# ==========================================
class TrainRequest(BaseModel):
    dataset_id: str
    model_type: str
    features: List[List[float]]
    targets: List[float]
    model_params: Optional[Dict[str, Any]] = None


class TrainResponse(BaseModel):
    id: Optional[str]
    model_type: str
    r2_score: float
    mse: float
    mae: Optional[float] = None
    coefficients: Optional[List[float]] = None
    intercept: Optional[float] = None
    predictions: List[float]
    training_time: Optional[float] = None
    created_at: Optional[datetime] = None

# ==========================================
# HISTORY
# ==========================================
class HistoryItem(BaseModel):
    id: Optional[str]
    model_id: Optional[str]
    step: str
    message: str
    created_at: Optional[datetime]

# ==========================================
# PREDICTION
# ==========================================
class PredictionRequest(BaseModel):
    model_id: str
    features: List[List[float]]


class PredictionResponse(BaseModel):
    predictions: List[float]

# ==========================================
# EXPLAIN / AI ASSISTANT
# ==========================================
class ExplainRequest(BaseModel):
    r2_score: float
    mse: float
    model_type: str


class ExplainResponse(BaseModel):
    input: Dict[str, Any]
    response: str
