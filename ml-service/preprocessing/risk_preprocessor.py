"""
Inventory Risk Preprocessing Module.
Extracts normalized numerical features, calculates risk ratios, and formats
feature matrices for supervised stock risk classification (LOW / MEDIUM / HIGH).
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


class InventoryRiskPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_columns = [
            "currentStock",
            "reorderLevel",
            "dailySalesVelocity",
            "weeklySalesVelocity",
            "monthlySalesVelocity",
            "daysRemaining",
            "recentDemand30d",
            "expiryDays",
            "stockToReorderRatio",
            "velocityToStockRatio"
        ]

    def build_features(self, items: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Builds raw tabular features from inventory records.
        """
        rows = []
        for item in items:
            stock = float(item.get("currentStock") if item.get("currentStock") is not None else 0.0)
            reorder = max(1.0, float(item.get("reorderLevel") if item.get("reorderLevel") is not None else 10.0))
            daily_vel = max(0.0, float(item.get("dailySalesVelocity") if item.get("dailySalesVelocity") is not None else 0.1))
            weekly_vel = float(item.get("weeklySalesVelocity") if item.get("weeklySalesVelocity") is not None else daily_vel * 7.0)
            monthly_vel = float(item.get("monthlySalesVelocity") if item.get("monthlySalesVelocity") is not None else daily_vel * 30.0)
            days_rem = float(item.get("daysRemaining") if item.get("daysRemaining") is not None else stock / max(0.1, daily_vel))
            recent_demand = float(item.get("recentDemand30d") if item.get("recentDemand30d") is not None else monthly_vel)
            expiry = float(item.get("expiryDays") if item.get("expiryDays") is not None else 90.0)

            # Engineered interaction ratios
            stock_reorder_ratio = stock / reorder
            velocity_stock_ratio = daily_vel / max(1.0, stock)

            rows.append({
                "productId": item.get("productId", ""),
                "productName": item.get("productName", ""),
                "storeId": item.get("storeId", "store-01"),
                "currentStock": stock,
                "reorderLevel": reorder,
                "dailySalesVelocity": daily_vel,
                "weeklySalesVelocity": weekly_vel,
                "monthlySalesVelocity": monthly_vel,
                "daysRemaining": min(days_rem, 365.0),
                "recentDemand30d": recent_demand,
                "expiryDays": min(expiry, 365.0),
                "stockToReorderRatio": stock_reorder_ratio,
                "velocityToStockRatio": velocity_stock_ratio
            })

        return pd.DataFrame(rows)

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Fits scaler and transforms numerical feature matrix.
        """
        X = df[self.feature_columns].values
        X_scaled = self.scaler.fit_transform(X)
        self.is_fitted = True
        return X_scaled

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Transforms feature matrix using fitted scaler.
        """
        if not self.is_fitted:
            raise ValueError("InventoryRiskPreprocessor must be fitted before calling transform.")
        X = df[self.feature_columns].values
        return self.scaler.transform(X)
