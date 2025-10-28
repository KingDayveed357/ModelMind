from __future__ import annotations

from typing import Dict


def explain_metrics(input_payload: Dict) -> str:
    r2 = input_payload.get("r2_score")
    mse = input_payload.get("mse")
    model_type = input_payload.get("model_type")
    parts = []
    if r2 is not None:
        parts.append(f"R²={r2:.2f} means the model explains roughly {r2*100:.0f}% of variance.")
    if mse is not None:
        parts.append(f"MSE={mse:.3f} reflects the average squared error; lower is better.")
    if model_type:
        parts.append(f"Model: {model_type}.")
    if not parts:
        return "Provide r2_score, mse, and model_type for an explanation."
    return " ".join(parts)


