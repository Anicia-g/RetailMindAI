"""
Demand Forecasting Training Pipeline (ARIMA & Holt-Winters).
Performs:
1. Daily chronological sales series extraction
2. Zero-demand handling and calendar alignment
3. Chronological train/test split (no data leakage)
4. Model Fitting:
   - ARIMA(p, d, q) via statsmodels
   - Holt-Winters Exponential Smoothing (trend + optional seasonality)
5. Out-of-sample Evaluation (MAE, RMSE, sMAPE zero-safe)
6. Model comparison and serialization via joblib and JSON
"""

import json
import os
import sys
import warnings
from typing import Dict, Any, List, Tuple
import joblib
import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing

warnings.filterwarnings("ignore")

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing.time_series_preprocessor import TimeSeriesPreprocessor


def calculate_forecast_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes MAE, RMSE, and symmetric MAPE (sMAPE) safely handling zero values.
    """
    y_true = np.array(y_true, dtype=float)
    y_pred = np.array(y_pred, dtype=float).clip(min=0.0)

    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))

    # Zero-safe symmetric MAPE: (|y - y_hat|) / ((|y| + |y_hat|)/2 + eps)
    denominator = (np.abs(y_true) + np.abs(y_pred)) / 2.0 + 1e-6
    smape = float(np.mean(np.abs(y_true - y_pred) / denominator) * 100)

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "smape": round(smape, 2)
    }


def generate_product_demand_series(product_id: str, days: int = 90) -> pd.Series:
    """
    Generates a realistic 90-day daily sales history with weekday/weekend patterns
    and realistic demand variance for retail items.
    """
    np.random.seed(abs(hash(product_id)) % (2**32))
    end_date = pd.Timestamp.now().normalize()
    dates = pd.date_range(end=end_date, periods=days, freq="D")

    # Product baselines
    baselines = {
        "prod-001": 22.0,  # Milk (high velocity, daily staple)
        "prod-002": 14.0,  # Bread (daily fresh)
        "prod-003": 8.0,   # Rice (weekly bulk)
        "prod-004": 11.0,  # Yogurt (fast dairy)
        "prod-005": 6.0,   # Olive Oil
        "prod-006": 18.0,  # Cookies & Snacks
    }
    base = baselines.get(product_id, 10.0)

    series_vals = []
    for d in dates:
        # Weekend boost (Saturday/Sunday has ~30% higher supermarket demand)
        day_of_week = d.dayofweek
        weekend_factor = 1.35 if day_of_week in [5, 6] else 1.0
        # Mild upward trend
        trend = (d - dates[0]).days * 0.03
        noise = np.random.normal(loc=0.0, scale=base * 0.25)
        demand = max(0.0, round(base * weekend_factor + trend + noise))
        series_vals.append(demand)

    return pd.Series(series_vals, index=dates, name="unitsSold")


def train_demand_forecasting(save_dir: str = "models") -> Dict[str, Any]:
    os.makedirs(save_dir, exist_ok=True)
    print("🚀 [Forecasting] Initiating ARIMA & Holt-Winters Demand Models Training...")

    preprocessor = TimeSeriesPreprocessor()
    products = ["prod-001", "prod-002", "prod-003", "prod-004", "prod-005", "prod-006"]
    saved_models = {}
    evaluation_report = {}

    for pid in products:
        series = generate_product_demand_series(pid, days=90)
        train_series, test_series = preprocessor.train_test_split(series, test_size=14)

        # 1. Fit ARIMA
        arima_order = (2, 1, 1)
        arima_fit = None
        arima_metrics = {"mae": 999.0, "rmse": 999.0, "smape": 999.0}
        try:
            arima_model = ARIMA(train_series, order=arima_order)
            arima_fit = arima_model.fit()
            arima_pred = arima_fit.forecast(steps=len(test_series))
            arima_metrics = calculate_forecast_metrics(test_series.values, arima_pred.values)
        except Exception as e:
            print(f"  ⚠️ ARIMA fit error for {pid}: {e}")

        # 2. Fit Holt-Winters Exponential Smoothing
        hw_fit = None
        hw_metrics = {"mae": 999.0, "rmse": 999.0, "smape": 999.0}
        try:
            hw_model = ExponentialSmoothing(
                train_series,
                trend="add",
                damped_trend=True,
                seasonal="add",
                seasonal_periods=7,
                initialization_method="estimated"
            )
            hw_fit = hw_model.fit()
            hw_pred = hw_fit.forecast(steps=len(test_series))
            hw_metrics = calculate_forecast_metrics(test_series.values, hw_pred.values)
        except Exception as e:
            print(f"  ⚠️ Holt-Winters fit error for {pid}: {e}")

        # 3. Model Selection: Choose model with lower RMSE
        best_model_name = "Holt-Winters" if hw_metrics["rmse"] <= arima_metrics["rmse"] else "ARIMA"
        best_metrics = hw_metrics if best_model_name == "Holt-Winters" else arima_metrics

        # Retrain winning model on full 90-day series for production inference
        if best_model_name == "Holt-Winters":
            full_model = ExponentialSmoothing(
                series,
                trend="add",
                damped_trend=True,
                seasonal="add",
                seasonal_periods=7,
                initialization_method="estimated"
            ).fit()
        else:
            full_model = ARIMA(series, order=arima_order).fit()

        saved_models[pid] = {
            "model_name": best_model_name,
            "fitted_model": full_model,
            "last_date": str(series.index[-1].date()),
            "last_value": float(series.iloc[-1])
        }

        evaluation_report[pid] = {
            "productId": pid,
            "winningModel": best_model_name,
            "arima": {
                "order": arima_order,
                "metrics": arima_metrics
            },
            "holtWinters": {
                "seasonalPeriods": 7,
                "metrics": hw_metrics
            },
            "bestMetrics": best_metrics
        }

        print(f"  • {pid}: Winner={best_model_name} | MAE={best_metrics['mae']}, RMSE={best_metrics['rmse']}, sMAPE={best_metrics['smape']}%")

    # Serialize artifacts
    models_path = os.path.join(save_dir, "forecast_models.pkl")
    metadata_path = os.path.join(save_dir, "forecast_metadata.json")

    joblib.dump(saved_models, models_path)

    metadata = {
        "modelName": "demand-forecasting-suite",
        "modelVersion": "1.0.0",
        "algorithms": ["ARIMA(2,1,1)", "Holt-Winters Exponential Smoothing"],
        "historyDays": 90,
        "holdoutTestDays": 14,
        "evaluationReport": evaluation_report
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"💾 Forecasting models saved to '{save_dir}/': forecast_models.pkl, forecast_metadata.json\n")
    return metadata


if __name__ == "__main__":
    train_demand_forecasting()
