"""
Supervised Inventory Risk Prediction Training Pipeline.
Evaluates Random Forest, Gradient Boosting, and Logistic Regression on retail inventory features.
Computes Accuracy, Precision, Recall, F1, and Confusion Matrix.
Serializes model and metadata to disk.
"""

import json
import os
import sys
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.model_selection import train_test_split

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing.risk_preprocessor import InventoryRiskPreprocessor


def generate_inventory_risk_dataset(n_samples: int = 500) -> pd.DataFrame:
    """
    Generates a realistic inventory dataset with verified domain target labels:
    - HIGH: Days remaining <= 3 OR stock <= reorderLevel with fast velocity OR expiry <= 3
    - MEDIUM: 3 < Days remaining <= 10 OR stock near reorderLevel
    - LOW: Days remaining > 10 and stock healthy above reorderLevel
    """
    np.random.seed(42)
    rows = []

    for i in range(n_samples):
        stock = float(np.random.choice([
            np.random.randint(2, 12),     # Low stock (35%)
            np.random.randint(15, 60),   # Medium stock (40%)
            np.random.randint(70, 200)   # High stock (25%)
        ], p=[0.35, 0.40, 0.25]))

        reorder = float(np.random.choice([15, 25, 40, 60, 80]))
        daily_vel = float(np.clip(np.random.exponential(scale=6.0), 0.1, 35.0))
        weekly_vel = round(daily_vel * 7.0, 1)
        monthly_vel = round(daily_vel * 30.0, 1)
        days_rem = round(stock / max(0.1, daily_vel), 1)
        recent_demand = round(monthly_vel * np.random.uniform(0.8, 1.2), 1)
        expiry_days = float(np.random.choice([
            np.random.randint(1, 4),    # Urgently expiring (20%)
            np.random.randint(5, 20),   # Near expiry (30%)
            np.random.randint(30, 180)  # Long shelf life (50%)
        ], p=[0.20, 0.30, 0.50]))

        # Objective domain rule for Ground Truth labeling
        if days_rem <= 3.5 or (stock <= reorder and daily_vel >= 5.0) or (expiry_days <= 3.0 and stock > 10.0):
            target = "HIGH"
        elif days_rem <= 12.0 or stock <= (reorder * 1.5) or expiry_days <= 10.0:
            target = "MEDIUM"
        else:
            target = "LOW"

        rows.append({
            "productId": f"prod-{i+1:04d}",
            "productName": f"Product Item {i+1}",
            "storeId": "store-01",
            "currentStock": stock,
            "reorderLevel": reorder,
            "dailySalesVelocity": daily_vel,
            "weeklySalesVelocity": weekly_vel,
            "monthlySalesVelocity": monthly_vel,
            "daysRemaining": days_rem,
            "recentDemand30d": recent_demand,
            "expiryDays": expiry_days,
            "riskLevel": target
        })

    return pd.DataFrame(rows)


def train_inventory_risk_model(save_dir: str = "models") -> Dict[str, Any]:
    os.makedirs(save_dir, exist_ok=True)
    print("🚀 [Inventory Risk] Initiating Supervised Risk Model Training...")

    raw_df = generate_inventory_risk_dataset(n_samples=600)
    preprocessor = InventoryRiskPreprocessor()

    features_df = preprocessor.build_features(raw_df.to_dict(orient="records"))
    X = preprocessor.fit_transform(features_df)
    y = raw_df["riskLevel"].values

    classes = ["LOW", "MEDIUM", "HIGH"]
    print(f"📊 Dataset Size: {len(raw_df)} samples. Class Distribution: {dict(pd.Series(y).value_counts())}")

    # Stratified Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Candidate Models
    models = {
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=80, learning_rate=0.1, random_state=42),
        "LogisticRegression": LogisticRegression(max_iter=500, random_state=42)
    }

    results = {}
    best_model_name = None
    best_f1 = -1.0
    best_model = None

    print("\n🔍 [Inventory Risk] Evaluating Supervised Classifiers:")
    for name, clf in models.items():
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
        rec = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
        cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()

        results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "macroF1": round(f1, 4),
            "confusionMatrix": cm
        }
        print(f"  • {name}: Acc={round(acc*100, 2)}%, Precision={round(prec*100, 2)}%, Recall={round(rec*100, 2)}%, F1={round(f1*100, 2)}%")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model = clf

    print(f"\n✅ [Inventory Risk] Selected Best Model: {best_model_name} (Macro F1 = {round(best_f1*100, 2)}%)")

    # Serialize
    model_path = os.path.join(save_dir, "inventory_risk_model.pkl")
    scaler_path = os.path.join(save_dir, "inventory_risk_scaler.pkl")
    metadata_path = os.path.join(save_dir, "inventory_risk_metadata.json")

    joblib.dump(best_model, model_path)
    joblib.dump(preprocessor, scaler_path)

    metadata = {
        "modelName": "inventory-risk-classifier",
        "modelVersion": "1.0.0",
        "bestModel": best_model_name,
        "datasetSize": len(raw_df),
        "classes": classes,
        "featureColumns": preprocessor.feature_columns,
        "metrics": results[best_model_name],
        "allModelComparisons": results
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"💾 Risk model saved to '{save_dir}/': inventory_risk_model.pkl, inventory_risk_scaler.pkl, inventory_risk_metadata.json\n")
    return metadata


if __name__ == "__main__":
    train_inventory_risk_model()
