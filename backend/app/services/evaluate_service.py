# app/services/evaluate_service.py

import numpy as np
import pandas as pd
import joblib
import json
import asyncio
from datetime import datetime
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, classification_report
)
from app.db.supabase_client import supabase

def load_model_from_storage(model_path: str):
    """
    Loads a trained model from local path or Supabase Storage.
    Assumes model was saved with joblib.
    """
    try:
        if model_path.startswith("http"):  # Supabase file URL
            import requests, io
            response = requests.get(model_path)
            response.raise_for_status()
            buffer = io.BytesIO(response.content)
            model = joblib.load(buffer)
        else:  # Local file
            with open(model_path, "rb") as f:
                model = joblib.load(f)
        return model
    except Exception as e:
        raise RuntimeError(f"Error loading model: {str(e)}")



# Core: Evaluate a regression or classification model
async def evaluate_model(model_id, model_path, X_test, y_test, user_id):
    """
    Evaluates a trained model using appropriate metrics,
    stores results in the 'evaluations' table, and returns the summary.
    """

    # Load model
    model = await asyncio.to_thread(load_model_from_storage, model_path)

    # Fetch model info (blocking, so wrap in thread)
    model_info_resp = await asyncio.to_thread(
        supabase.table("models").select("*").eq("id", model_id).execute
    )
    if not model_info_resp.data:
        raise ValueError(f"Model with id {model_id} not found.")

    model_info = model_info_resp.data[0]
    model_type = model_info.get("model_type", "unknown")
    problem_type = model_info.get("problem_type", "regression").lower()

    # Predict
    try:
        y_pred = model.predict(X_test)
    except Exception as e:
        raise RuntimeError(f"Model prediction failed: {str(e)}")

    # ---------------- REGRESSION ----------------
    if problem_type == "regression":
        n = len(y_test)
        p = getattr(X_test, "shape", [None, 1])[1] or 1

        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        adj_r2 = 1 - (1 - r2) * ((n - 1) / max(1, n - p - 1))

        metrics = {
            "MSE": mse,
            "RMSE": rmse,
            "MAE": mae,
            "R2": r2,
            "Adjusted_R2": adj_r2,
        }

        # Generate qualitative performance summary
        summary = _generate_summary_regression(metrics)

    # ---------------- CLASSIFICATION ----------------
    else:
        y_pred_class = np.round(y_pred).astype(int) if y_pred.ndim > 1 else y_pred

        accuracy = accuracy_score(y_test, y_pred_class)
        precision = precision_score(y_test, y_pred_class, average="weighted", zero_division=0)
        recall = recall_score(y_test, y_pred_class, average="weighted", zero_division=0)
        f1 = f1_score(y_test, y_pred_class, average="weighted", zero_division=0)

        try:
            roc_auc = roc_auc_score(y_test, y_pred, multi_class="ovr")
        except Exception:
            roc_auc = None

        metrics = {
            "Accuracy": accuracy,
            "Precision": precision,
            "Recall": recall,
            "F1_Score": f1,
            "ROC_AUC": roc_auc,
            "Confusion_Matrix": confusion_matrix(y_test, y_pred_class).tolist(),
        }

        summary = _generate_summary_classification(metrics)

    # JSON-safe serialization
    metrics_json = json.loads(json.dumps(metrics, default=str))
    summary_json = json.loads(json.dumps(summary, default=str))

    evaluation_data = {
        "model_id": model_id,
        "user_id": user_id,
        "model_type": model_type,
        "problem_type": problem_type,
        "metrics": metrics_json,
        "summary": summary_json,
        "created_at": datetime.utcnow().isoformat(),
    }

    # Insert results into Supabase (non-blocking safe)
    insert_resp = await asyncio.to_thread(
        supabase.table("evaluations").insert(evaluation_data).execute
    )

    return {"evaluation": evaluation_data, "db_response": insert_resp.data}


# -------------------------------------------------------------------
# Get all evaluations for a given model/user
# -------------------------------------------------------------------
async def get_model_evaluations(model_id: str, user_id: str):
    resp = await asyncio.to_thread(
        supabase.table("evaluations")
        .select("*")
        .eq("model_id", model_id)
        .eq("user_id", user_id)
        .execute
    )
    return resp.data


# -------------------------------------------------------------------
# Compare all models for a given user
# -------------------------------------------------------------------
async def compare_models(user_id: str):
    # Get all evaluations for user
    resp = await asyncio.to_thread(
        supabase.table("evaluations").select("*").eq("user_id", user_id).execute
    )
    evaluations = resp.data

    if not evaluations:
        return {"status": "error", "message": "No evaluations found for this user."}

    comparisons = []
    for eval_item in evaluations:
        model_info_resp = await asyncio.to_thread(
            supabase.table("models").select("*").eq("id", eval_item["model_id"]).execute
        )
        model_info = model_info_resp.data[0] if model_info_resp.data else {}

        comparisons.append({
            "model_name": model_info.get("name", "Unnamed Model"),
            "model_type": eval_item.get("model_type"),
            "problem_type": eval_item.get("problem_type"),
            "metrics": eval_item.get("metrics"),
            "summary": eval_item.get("summary"),
            "created_at": eval_item.get("created_at"),
        })

    # Determine problem type
    problem_type = comparisons[0].get("problem_type", "regression")

    # Rank models by best metric
    best_models = _rank_models(comparisons, problem_type)

    return {"status": "success", "best_models": best_models, "comparisons": comparisons}


# -------------------------------------------------------------------
# Helper: Generate human-readable summaries
# -------------------------------------------------------------------
def _generate_summary_regression(metrics):
    r2 = metrics["R2"]
    mae = metrics["MAE"]
    rmse = metrics["RMSE"]

    if r2 > 0.9:
        perf = "Excellent"
    elif r2 > 0.75:
        perf = "Good"
    elif r2 > 0.5:
        perf = "Moderate"
    else:
        perf = "Poor"

    return {
        "performance": perf,
        "insight": f"Model explains {r2:.2f} variance. MAE={mae:.2f}, RMSE={rmse:.2f} — lower is better."
    }


def _generate_summary_classification(metrics):
    acc = metrics["Accuracy"]
    f1 = metrics["F1_Score"]

    if acc > 0.9 and f1 > 0.9:
        perf = "Excellent"
    elif acc > 0.75:
        perf = "Good"
    elif acc > 0.5:
        perf = "Moderate"
    else:
        perf = "Poor"

    return {
        "performance": perf,
        "insight": f"Accuracy={acc:.2f}, F1={f1:.2f}. Model performance is {perf.lower()} overall."
    }


# -------------------------------------------------------------------
# Helper: Rank models by best metric
# -------------------------------------------------------------------
def _rank_models(comparisons, problem_type):
    key = "R2" if problem_type == "regression" else "Accuracy"
    ranked = sorted(
        comparisons,
        key=lambda m: m.get("metrics", {}).get(key, 0),
        reverse=True
    )
    return ranked
