from __future__ import annotations

from io import BytesIO
from typing import Tuple

import pandas as pd


def parse_tabular_file(file_bytes: bytes, filename: str) -> Tuple[pd.DataFrame, dict]:
    name_lower = filename.lower()
    if name_lower.endswith(".csv"):
        df = pd.read_csv(BytesIO(file_bytes))
    elif name_lower.endswith(".xlsx") or name_lower.endswith(".xls"):
        df = pd.read_excel(BytesIO(file_bytes))
    else:
        raise ValueError("Unsupported file type. Please upload CSV or Excel.")

    summary = {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "feature_names": list(map(str, df.columns.tolist())),
        "has_missing": bool(df.isna().any().any()),
    }
    return df, summary


