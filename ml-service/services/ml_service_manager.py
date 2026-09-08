"""
ML Service Manager.
Singleton orchestrator managing pre-loaded prediction engines and model metadata.
"""

import json
import os
from typing import Dict, Any, Optional

from prediction.kmeans_predictor import KMeansPredictor
from prediction.forecast_predictor import ForecastPredictor
from prediction.risk_predictor import InventoryRiskPredictor
from prediction.discount_predictor import DiscountPredictor
from prediction.recommendation_predictor import RecommendationPredictor
from prediction.anomaly_predictor import AnomalyPredictor


class MLServiceManager:
    _instance: Optional["MLServiceManager"] = None

    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.kmeans = KMeansPredictor(models_dir)
        self.forecast = ForecastPredictor(models_dir)
        self.risk = InventoryRiskPredictor(models_dir)
        self.discount = DiscountPredictor(models_dir)
        self.recommendations = RecommendationPredictor(models_dir)
        self.anomaly = AnomalyPredictor(models_dir)

    @classmethod
    def get_instance(cls, models_dir: str = "models") -> "MLServiceManager":
        if cls._instance is None:
            cls._instance = cls(models_dir)
        return cls._instance

    def get_all_performance_metadata(self) -> Dict[str, Any]:
        """Loads metadata from all trained models."""
        metadata_files = {
            "customerSegmentation": "kmeans_metadata.json",
            "demandForecasting": "forecast_metadata.json",
            "inventoryRisk": "inventory_risk_metadata.json",
            "discountDecisionTrees": "discount_metadata.json",
            "recommendations": "recommendations_metadata.json",
            "anomalyDetection": "anomaly_metadata.json",
            "masterSummary": "master_training_summary.json"
        }

        all_meta = {}
        for key, fname in metadata_files.items():
            fpath = os.path.join(self.models_dir, fname)
            if os.path.exists(fpath):
                try:
                    with open(fpath, "r") as f:
                        all_meta[key] = json.load(f)
                except Exception as e:
                    all_meta[key] = {"error": str(e)}
            else:
                all_meta[key] = {"status": "NOT_FOUND"}

        return all_meta
