"""
Master Training Pipeline Runner.
Executes data preprocessing, training, evaluation, and serialization
for all 6 RetailMind AI Machine Learning models in sequence:
1. Customer Segmentation (RFM + K-Means)
2. Demand Forecasting (ARIMA & Holt-Winters)
3. Inventory Risk Classification (Supervised ML)
4. Smart Discount Recommendation (ID3 & C4.5 Decision Trees)
5. Product Co-purchase Recommendations (Association Mining)
6. Transaction Anomaly Detection (Isolation Forest)
"""

import json
import os
import sys
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from training.train_kmeans import train_kmeans_segmentation
from training.train_forecast import train_demand_forecasting
from training.train_inventory_risk import train_inventory_risk_model
from training.train_discount_trees import train_discount_decision_trees
from training.train_recommendations import train_recommendation_system
from training.train_anomaly import train_anomaly_detection_model


def run_all_training_pipelines(models_dir: str = "models"):
    start_time = time.time()
    print("=================================================================")
    print("🧠 RETAILMIND AI — MASTER MACHINE LEARNING TRAINING PIPELINE")
    print("=================================================================\n")

    os.makedirs(models_dir, exist_ok=True)
    summary_report = {}

    # 1. K-Means Customer Segmentation
    kmeans_meta = train_kmeans_segmentation(models_dir)
    summary_report["customerSegmentation"] = {
        "algorithm": kmeans_meta["algorithm"],
        "k": kmeans_meta["k"],
        "silhouetteScore": kmeans_meta["silhouetteScore"],
        "status": "TRAINED_AND_PERSISTED"
    }

    # 2. Demand Forecasting
    forecast_meta = train_demand_forecasting(models_dir)
    summary_report["demandForecasting"] = {
        "algorithms": forecast_meta["algorithms"],
        "productsCount": len(forecast_meta["evaluationReport"]),
        "status": "TRAINED_AND_PERSISTED"
    }

    # 3. Inventory Risk Classifier
    risk_meta = train_inventory_risk_model(models_dir)
    summary_report["inventoryRisk"] = {
        "bestModel": risk_meta["bestModel"],
        "macroF1": risk_meta["metrics"]["macroF1"],
        "accuracy": risk_meta["metrics"]["accuracy"],
        "status": "TRAINED_AND_PERSISTED"
    }

    # 4. Smart Discount Decision Trees
    discount_meta = train_discount_decision_trees(models_dir)
    summary_report["discountDecisionTrees"] = {
        "id3Accuracy": discount_meta["id3Metrics"]["accuracy"],
        "c45Accuracy": discount_meta["c45Metrics"]["accuracy"],
        "status": "TRAINED_AND_PERSISTED"
    }

    # 5. Recommendations
    rec_meta = train_recommendation_system(models_dir)
    summary_report["recommendations"] = {
        "algorithm": rec_meta["algorithm"],
        "totalBaskets": rec_meta["totalBasketsAnalyzed"],
        "status": "TRAINED_AND_PERSISTED"
    }

    # 6. Anomaly Detection
    anomaly_meta = train_anomaly_detection_model(models_dir)
    summary_report["anomalyDetection"] = {
        "algorithm": anomaly_meta["algorithm"],
        "contamination": anomaly_meta["contamination"],
        "status": "TRAINED_AND_PERSISTED"
    }

    elapsed = round(time.time() - start_time, 2)
    summary_report["pipelineExecutionTimeSeconds"] = elapsed
    summary_report["status"] = "ALL_MODELS_TRAINED_SUCCESSFULLY"

    with open(os.path.join(models_dir, "master_training_summary.json"), "w") as f:
        json.dump(summary_report, f, indent=2)

    print("=================================================================")
    print(f"🎉 MASTER TRAINING COMPLETED IN {elapsed}s")
    print("=================================================================\n")
    return summary_report


if __name__ == "__main__":
    run_all_training_pipelines()
