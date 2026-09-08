"""
K-Means Real-time Predictor Module.
Loads pre-trained K-Means model, scaler, and metadata.
Scores individual customer RFM vectors or batch lists in real-time.
"""

import json
import os
from typing import Dict, Any, List, Optional
import joblib
import pandas as pd
import numpy as np


class KMeansPredictor:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.model = None
        self.preprocessor = None
        self.metadata = {}
        self.cluster_mapping = {}
        self.load_artifacts()

    def load_artifacts(self):
        model_path = os.path.join(self.models_dir, "kmeans_model.pkl")
        scaler_path = os.path.join(self.models_dir, "kmeans_scaler.pkl")
        metadata_path = os.path.join(self.models_dir, "kmeans_metadata.json")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(scaler_path)

        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                self.metadata = json.load(f)
                self.cluster_mapping = {int(k): v for k, v in self.metadata.get("clusterMapping", {}).items()}

    def predict_single(self, customer_id: str, recency: float, frequency: float, monetary: float) -> Dict[str, Any]:
        if self.model is None or self.preprocessor is None:
            raise RuntimeError("KMeans model artifacts not loaded. Please train the model first.")

        scaled_point = self.preprocessor.transform_single(recency, frequency, monetary)
        cluster = int(self.model.predict(scaled_point)[0])
        segment = self.cluster_mapping.get(cluster, "Growing")

        # Calculate distance to assigned cluster centroid
        centroid = self.model.cluster_centers_[cluster]
        distance = float(np.linalg.norm(scaled_point[0] - centroid))

        # Generate actionable retail recommendation
        recommendations = {
            "VIP": "Eligible for Priority Concierge, exclusive private sales, and double SmartCoins rewards.",
            "Loyal": "Recommend weekly subscription bundles and category cross-sell discounts.",
            "Growing": "Incentivize 2nd and 3rd purchase with welcome discount coupons and instant cashback.",
            "At Risk": "Trigger win-back WhatsApp offer with 15% discount on top previously purchased items.",
            "Inactive": "Send re-engagement notification with high-value festive voucher."
        }

        return {
            "customerId": customer_id,
            "cluster": cluster,
            "segment": segment,
            "recency": float(recency),
            "frequency": float(frequency),
            "monetary": float(monetary),
            "confidenceScore": round(max(0.5, 1.0 - (distance / 5.0)), 2),
            "recommendation": recommendations.get(segment, "Maintain standard engagement.")
        }

    def predict_batch(self, customers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        for c in customers:
            res = self.predict_single(
                customer_id=c.get("customerId", "cust-unknown"),
                recency=float(c.get("recency", c.get("recencyDays", 10.0))),
                frequency=float(c.get("frequency", c.get("totalOrders", 1.0))),
                monetary=float(c.get("monetary", c.get("totalSpent", 500.0)))
            )
            results.append(res)
        return results
