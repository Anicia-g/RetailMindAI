"""
Transaction Anomaly Detection Training Pipeline (Isolation Forest).
Trains an unsupervised Isolation Forest model to detect unusual retail transaction vectors
(e.g., abnormally high basket values, unusual item counts, late-night cash sweeps).
Computes anomaly scores, decision thresholds, and saves model to disk.
"""

import json
import os
import sys
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


def generate_transaction_dataset(n_samples: int = 1000) -> pd.DataFrame:
    """
    Generates realistic retail transactions with ~4% natural edge-case anomalies:
    - Normal transactions: Amount Rs. 200 - 4500, Items 1 - 12, Hours 8 AM - 10 PM
    - Anomalies: Amount > Rs. 25,000, Items > 40, Hours 1 AM - 5 AM with high spend
    """
    np.random.seed(42)
    rows = []

    # 1. Normal retail checkout transactions (96%)
    n_normal = int(n_samples * 0.96)
    for _ in range(n_normal):
        items = int(np.random.choice([1, 2, 3, 4, 5, 6, 8, 10], p=[0.20, 0.25, 0.20, 0.15, 0.08, 0.06, 0.04, 0.02]))
        avg_price = float(np.clip(np.random.normal(loc=180, scale=60), 40, 600))
        amount = round(items * avg_price, 2)
        hour = int(np.random.choice(range(8, 23)))  # 8 AM to 10 PM
        discount_pct = float(np.random.choice([0, 5, 10, 15], p=[0.50, 0.25, 0.15, 0.10]))

        rows.append({
            "totalAmount": amount,
            "itemCount": items,
            "avgItemPrice": round(avg_price, 2),
            "hourOfDay": hour,
            "discountPct": discount_pct,
            "isSyntheticAnomaly": 0
        })

    # 2. Unusual / anomalous transactions (4%)
    n_anomalies = n_samples - n_normal
    for _ in range(n_anomalies):
        anomaly_type = np.random.choice(["bulk_hoarding", "high_value_midnight", "extreme_discount"])
        if anomaly_type == "bulk_hoarding":
            items = int(np.random.randint(45, 120))
            amount = round(items * np.random.uniform(150, 400), 2)
            hour = int(np.random.randint(10, 20))
            disc = 5.0
        elif anomaly_type == "high_value_midnight":
            items = int(np.random.randint(15, 30))
            amount = round(np.random.uniform(28000, 75000), 2)
            hour = int(np.random.choice([1, 2, 3, 4]))  # Midnight / early morning
            disc = 0.0
        else:
            items = int(np.random.randint(5, 15))
            amount = round(np.random.uniform(8000, 18000), 2)
            hour = 15
            disc = float(np.random.uniform(35, 60))  # Abnormal discount

        rows.append({
            "totalAmount": amount,
            "itemCount": items,
            "avgItemPrice": round(amount / items, 2),
            "hourOfDay": hour,
            "discountPct": disc,
            "isSyntheticAnomaly": 1
        })

    return pd.DataFrame(rows)


def train_anomaly_detection_model(save_dir: str = "models") -> Dict[str, Any]:
    os.makedirs(save_dir, exist_ok=True)
    print("🚀 [Anomaly Detection] Training Isolation Forest for Suspicious Retail Transactions...")

    df = generate_transaction_dataset(n_samples=1200)
    features = ["totalAmount", "itemCount", "avgItemPrice", "hourOfDay", "discountPct"]
    X_raw = df[features].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)

    # Train Isolation Forest with 4% contamination
    iso_forest = IsolationForest(
        n_estimators=120,
        contamination=0.04,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_scaled)

    # Predict: -1 for anomaly, 1 for normal
    preds = iso_forest.predict(X_scaled)
    scores = iso_forest.decision_function(X_scaled)

    df["anomalyFlag"] = (preds == -1).astype(int)
    df["anomalyScore"] = np.round(scores, 4)

    detected_anomalies = int((preds == -1).sum())
    print(f"📊 Total Transactions: {len(df)} | Flagged as Anomalous: {detected_anomalies} ({round(detected_anomalies/len(df)*100, 2)}%)")

    # Serialize artifacts
    model_path = os.path.join(save_dir, "anomaly_model.pkl")
    scaler_path = os.path.join(save_dir, "anomaly_scaler.pkl")
    metadata_path = os.path.join(save_dir, "anomaly_metadata.json")

    joblib.dump(iso_forest, model_path)
    joblib.dump(scaler, scaler_path)

    metadata = {
        "modelName": "retail-transaction-anomaly-detector",
        "modelVersion": "1.0.0",
        "algorithm": "Isolation Forest",
        "contamination": 0.04,
        "nEstimators": 120,
        "features": features,
        "datasetSize": len(df),
        "detectedAnomalyCount": detected_anomalies,
        "minDecisionScore": round(float(scores.min()), 4),
        "maxDecisionScore": round(float(scores.max()), 4),
        "threshold": round(float(np.percentile(scores, 4)), 4)
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"💾 Anomaly model saved to '{save_dir}/': anomaly_model.pkl, anomaly_scaler.pkl, anomaly_metadata.json\n")
    return metadata


if __name__ == "__main__":
    train_anomaly_detection_model()
