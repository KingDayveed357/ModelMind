# app/core/model_selector.py
from flaml.automl import AutoML
import pandas as pd
from typing import Dict, Any, Tuple
import time
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

class AutoModelSelector:
    def __init__(self, task: str, time_budget: int = 60, n_jobs: int = 1, estimator_list: list = None, metric: str = None, verbose: int = 0):
        self.task = task
        self.time_budget = time_budget
        self.n_jobs = n_jobs
        self.estimator_list = estimator_list
        self.metric = metric
        self.verbose = verbose
        self.automl = AutoML()

    def select_best_model(self, X_train: pd.DataFrame, y_train: pd.Series) -> Tuple[Any, Dict[str, Any]]:
        """Run AutoML and return the fitted model + info dict."""
        try:
            fit_kwargs = {
                "X_train": X_train,
                "y_train": y_train,
                "task": self.task,
                "time_budget": self.time_budget,
                "n_jobs": self.n_jobs,
                "verbose": self.verbose,
            }
            if self.estimator_list:
                fit_kwargs["estimator_list"] = self.estimator_list
            if self.metric:
                fit_kwargs["metric"] = self.metric

            start = time.time()
            self.automl.fit(**fit_kwargs)
            elapsed = time.time() - start

            # Ensure automl.model exists
            best_model = getattr(self.automl, "model", None)
            if best_model is None:
                print("[AutoML] Warning: No model found. Possible reasons: time_budget too low or invalid data.")
                print("[AutoML] Trying fallback with RandomForestRegressor...")
                if self.task == "regression":
                    best_model = RandomForestRegressor(n_estimators=100, random_state=42)
                else:
                    best_model = RandomForestClassifier(n_estimators=100, random_state=42)
                best_model.fit(X_train, y_train)

            reason = {
                "best_model": str(type(best_model).__name__),
                "best_config": getattr(self.automl, "best_config", None),
                "metric_used": getattr(self.automl, "_metric", getattr(self.automl, "metric", None)),
                "best_loss": getattr(self.automl, "best_loss", None),
                "time_used": elapsed,
            }

            return best_model, reason
        except Exception as e:
            # Re-raise with context so calling code can handle/log
            raise RuntimeError(f"AutoML selection failed: {str(e)}")
