"""
RFM Preprocessing Module for Customer Segmentation.
Handles outlier inspection, zero/missing values, log1p scaling for skewed monetary distributions,
and standardized scaling for K-Means clustering.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, RobustScaler


class RFMPreprocessor:
    def __init__(self, use_log_transform: bool = True, scaler_type: str = "standard"):
        self.use_log_transform = use_log_transform
        self.scaler = StandardScaler() if scaler_type == "standard" else RobustScaler()
        self.is_fitted = False
        self.feature_names = ["recency", "frequency", "monetary"]

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Fits the scaler and transforms the RFM DataFrame.
        Expected columns: ['recency', 'frequency', 'monetary'] (or ['recencyDays', 'frequency', 'monetary'])
        """
        clean_df = self._clean_data(df)
        transformed_df = self._transform_features(clean_df)
        scaled_features = self.scaler.fit_transform(transformed_df[self.feature_names])
        self.is_fitted = True
        return scaled_features

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Transforms new incoming RFM feature rows using the fitted scaler.
        """
        if not self.is_fitted:
            raise ValueError("RFMPreprocessor must be fitted before calling transform.")
        clean_df = self._clean_data(df)
        transformed_df = self._transform_features(clean_df)
        return self.scaler.transform(transformed_df[self.feature_names])

    def transform_single(self, recency: float, frequency: float, monetary: float) -> np.ndarray:
        """
        Transforms a single RFM point for real-time inference.
        """
        df = pd.DataFrame([{
            "recency": max(0.0, float(recency)),
            "frequency": max(1.0, float(frequency)),
            "monetary": max(0.0, float(monetary))
        }])
        return self.transform(df)

    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        data = df.copy()
        # Normalize column names
        if "recencyDays" in data.columns and "recency" not in data.columns:
            data["recency"] = data["recencyDays"]
        if "totalSpent" in data.columns and "monetary" not in data.columns:
            data["monetary"] = data["totalSpent"]
        if "totalOrders" in data.columns and "frequency" not in data.columns:
            data["frequency"] = data["totalOrders"]

        for col in self.feature_names:
            if col not in data.columns:
                raise KeyError(f"Missing required RFM column '{col}' in input DataFrame")
            data[col] = pd.to_numeric(data[col], errors="coerce").fillna(0.0)

        # Enforce non-negative bounds
        data["recency"] = data["recency"].clip(lower=0.0)
        data["frequency"] = data["frequency"].clip(lower=1.0)
        data["monetary"] = data["monetary"].clip(lower=0.0)
        return data

    def _transform_features(self, df: pd.DataFrame) -> pd.DataFrame:
        transformed = df.copy()
        if self.use_log_transform:
            # Log transform monetary and frequency to mitigate exponential skewness
            transformed["frequency"] = np.log1p(transformed["frequency"])
            transformed["monetary"] = np.log1p(transformed["monetary"])
            # Recency: apply sqrt or log1p to compress right tail
            transformed["recency"] = np.log1p(transformed["recency"])
        return transformed
