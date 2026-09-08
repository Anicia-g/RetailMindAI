"""
Discount Preprocessing Module for ID3 and C4.5 Decision Trees.
Discretizes continuous retail metrics (margins, sales velocity, days to expiry, current stock)
into discrete categorical attributes suitable for Shannon Entropy and Information Gain / Gain Ratio splits.
"""

from typing import List, Dict, Any
import pandas as pd
import numpy as np


class DiscountPreprocessor:
    def __init__(self):
        self.feature_columns = [
            "margin_tier",
            "stock_level",
            "velocity_tier",
            "expiry_urgency",
            "season"
        ]

    def discretize_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms raw continuous columns into categorical bins for decision tree induction:
        - margin_tier: LOW (<20%), MEDIUM (20-35%), HIGH (>35%)
        - stock_level: CRITICAL (<15), NORMAL (15-50), OVERSTOCK (>50)
        - velocity_tier: SLOW (<5 units/day), MODERATE (5-15 units/day), FAST (>15 units/day)
        - expiry_urgency: URGENT (<=3 days), NEAR (4-14 days), SAFE (>14 days)
        - season: MONSOON, FESTIVE, SUMMER, WINTER
        """
        data = df.copy()

        # 1. Profit Margin Tier
        margin = pd.to_numeric(data.get("profitMarginPct", data.get("profitMargin", 25.0)), errors="coerce").fillna(25.0)
        data["margin_tier"] = pd.cut(
            margin,
            bins=[-float("inf"), 20.0, 35.0, float("inf")],
            labels=["LOW", "MEDIUM", "HIGH"]
        ).astype(str)

        # 2. Stock Level
        stock = pd.to_numeric(data.get("currentStock", data.get("stock", 20.0)), errors="coerce").fillna(20.0)
        data["stock_level"] = pd.cut(
            stock,
            bins=[-float("inf"), 15.0, 50.0, float("inf")],
            labels=["CRITICAL", "NORMAL", "OVERSTOCK"]
        ).astype(str)

        # 3. Sales Velocity Tier
        velocity = pd.to_numeric(data.get("salesVelocity", data.get("dailySalesVelocity", 5.0)), errors="coerce").fillna(5.0)
        data["velocity_tier"] = pd.cut(
            velocity,
            bins=[-float("inf"), 5.0, 15.0, float("inf")],
            labels=["SLOW", "MODERATE", "FAST"]
        ).astype(str)

        # 4. Expiry Urgency
        expiry = pd.to_numeric(data.get("daysToExpiry", data.get("expiryDays", 30.0)), errors="coerce").fillna(30.0)
        data["expiry_urgency"] = pd.cut(
            expiry,
            bins=[-float("inf"), 3.0, 14.0, float("inf")],
            labels=["URGENT", "NEAR", "SAFE"]
        ).astype(str)

        # 5. Season
        if "season" not in data.columns:
            data["season"] = "MONSOON"
        else:
            data["season"] = data["season"].astype(str).str.upper()

        return data[self.feature_columns]

    def discretize_single(self, margin: float, stock: float, velocity: float, expiry_days: float, season: str = "MONSOON") -> Dict[str, str]:
        """
        Discretizes a single product data point for real-time inference.
        """
        df = pd.DataFrame([{
            "profitMarginPct": float(margin),
            "currentStock": float(stock),
            "salesVelocity": float(velocity),
            "daysToExpiry": float(expiry_days),
            "season": str(season)
        }])
        discretized = self.discretize_features(df)
        return discretized.iloc[0].to_dict()
