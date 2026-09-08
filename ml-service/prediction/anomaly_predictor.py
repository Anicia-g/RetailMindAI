"""
Transaction Anomaly Predictor Module.
Loads pre-trained Isolation Forest model and feature scaler.
Scores checkout transactions, flags unusual/anomalous behavior, and details contributing metrics.
"""

import json
import os
from typing import Dict, Any, List, Optional
import joblib
import numpy as np
import pandas as pd


class AnomalyPredictor:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.model = None
        self.scaler = None
        self.metadata = {}
        self.load_artifacts()

    def load_artifacts(self):
        model_path = os.path.join(self.models_dir, "anomaly_model.pkl")
        scaler_path = os.path.join(self.models_dir, "anomaly_scaler.pkl")
        metadata_path = os.path.join(self.models_dir, "anomaly_metadata.json")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)

        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                self.metadata = json.load(f)

    def predict(
        self,
        transaction_id: str,
        total_amount: float,
        item_count: int,
        hour_of_day: int = 14,
        discount_pct: float = 0.0
    ) -> Dict[str, Any]:
        if self.model is None or self.scaler is None:
            raise RuntimeError("Anomaly Detection model not loaded. Please train the model first.")

        item_count = max(1, int(item_count))
        total_amount = max(1.0, float(total_amount))
        avg_price = total_amount / item_count
        hour_of_day = max(0, min(23, int(hour_of_day)))
        discount_pct = max(0.0, min(100.0, float(discount_pct)))

        feature_vector = np.array([[
            total_amount,
            float(item_count),
            avg_price,
            float(hour_of_day),
            discount_pct
        ]])

        scaled_vector = self.scaler.transform(feature_vector)
        pred = self.model.predict(scaled_vector)[0]
        raw_score = float(self.model.decision_function(scaled_vector)[0])

        is_anomaly = bool(pred == -1)

        # Anomaly score normalized to 0.0 (normal) to 1.0 (highly unusual)
        normalized_anomaly_score = round(float(np.clip(1.0 - (raw_score + 0.5), 0.0, 1.0)), 3)

        flagged_factors = []
        if total_amount >= 20000.0:
            flagged_factors.append(f"High transaction value (Rs. {total_amount:,.2f}) exceeding 99th percentile threshold")
        if item_count >= 30:
            flagged_factors.append(f"Abnormally large basket size ({item_count} items)")
        if hour_of_day in [0, 1, 2, 3, 4, 5]:
            flagged_factors.append(f"Unusual transaction time ({hour_of_day:02d}:00 hours)")
        if discount_pct >= 30.0:
            flagged_factors.append(f"High manual discount override ({discount_pct}%)")

        if is_anomaly and not flagged_factors:
            flagged_factors.append("Multi-dimensional multivariate feature deviation detected by Isolation Forest")

        status_label = "Unusual - Requires Manager Review" if is_anomaly else "Normal Transaction"

        return {
            "transactionId": transaction_id,
            "totalAmount": total_amount,
            "itemCount": item_count,
            "hourOfDay": hour_of_day,
            "isAnomaly": is_anomaly,
            "anomalyScore": normalized_anomaly_score,
            "status": status_label,
            "importantFeatures": flagged_factors if is_anomaly else ["All transaction parameters within normal bounds"],
            "algorithm": "Isolation Forest (Unsupervised)"
        }
