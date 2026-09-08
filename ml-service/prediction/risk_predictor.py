"""
Inventory Risk Predictor Module.
Loads pre-trained supervised classifier and feature scaler.
Predicts risk levels (LOW, MEDIUM, HIGH), probabilities, and top risk factors.
"""

import json
import os
from typing import Dict, Any, List, Optional
import joblib
import pandas as pd
import numpy as np


class InventoryRiskPredictor:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.model = None
        self.preprocessor = None
        self.metadata = {}
        self.load_artifacts()

    def load_artifacts(self):
        model_path = os.path.join(self.models_dir, "inventory_risk_model.pkl")
        scaler_path = os.path.join(self.models_dir, "inventory_risk_scaler.pkl")
        metadata_path = os.path.join(self.models_dir, "inventory_risk_metadata.json")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(scaler_path)

        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                self.metadata = json.load(f)

    def predict_single(self, item: Dict[str, Any]) -> Dict[str, Any]:
        if self.model is None or self.preprocessor is None:
            raise RuntimeError("Inventory risk model not loaded. Please train the model first.")

        features_df = self.preprocessor.build_features([item])
        X_scaled = self.preprocessor.transform(features_df)

        risk_level = str(self.model.predict(X_scaled)[0])

        # Get class probabilities if available
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X_scaled)[0]
            classes = list(self.model.classes_)
            prob_dict = {cls: round(float(p), 4) for cls, p in zip(classes, probs)}
            top_prob = float(max(probs))
        else:
            prob_dict = {risk_level: 0.85}
            top_prob = 0.85

        # Extract human-interpretable risk factors
        factors = []
        stock = float(item.get("currentStock", 0))
        reorder = float(item.get("reorderLevel", 10))
        daily_vel = float(item.get("dailySalesVelocity", 1.0))
        expiry = float(item.get("expiryDays", 90))
        days_rem = stock / max(0.1, daily_vel)

        if stock <= reorder:
            factors.append(f"Stock ({int(stock)} units) below reorder threshold ({int(reorder)} units)")
        if days_rem <= 3.0:
            factors.append(f"Critical depletion runway: only {round(days_rem, 1)} days of stock remaining")
        elif days_rem <= 7.0:
            factors.append(f"Low inventory runway: {round(days_rem, 1)} days remaining at current velocity")
        if daily_vel >= 10.0:
            factors.append(f"High sales velocity ({round(daily_vel, 1)} units/day) accelerating stock depletion")
        if expiry <= 3.0:
            factors.append(f"Urgently expiring batch: only {int(expiry)} days to expiry")
        elif expiry <= 7.0:
            factors.append(f"Approaching expiry window: {int(expiry)} days remaining")

        if not factors:
            factors.append("Inventory levels healthy and balanced against consumer demand")

        # Actionable replenishment recommendation
        suggested_reorder = max(0, int((daily_vel * 14) + reorder - stock))

        return {
            "productId": item.get("productId", ""),
            "productName": item.get("productName", ""),
            "storeId": item.get("storeId", "store-01"),
            "currentStock": int(stock),
            "riskLevel": risk_level,
            "stockOutProbability": round(top_prob, 2),
            "classProbabilities": prob_dict,
            "daysRemaining": round(days_rem, 1),
            "suggestedReorderQuantity": suggested_reorder,
            "importantFactors": factors,
            "modelVersion": self.metadata.get("modelVersion", "1.0.0")
        }

    def predict_batch(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self.predict_single(it) for it in items]
