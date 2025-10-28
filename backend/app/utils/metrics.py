from __future__ import annotations

from typing import List

from sklearn.metrics import mean_squared_error, r2_score


def compute_r2(y_true: List[float], y_pred: List[float]) -> float:
    return float(r2_score(y_true, y_pred))


def compute_mse(y_true: List[float], y_pred: List[float]) -> float:
    return float(mean_squared_error(y_true, y_pred))


