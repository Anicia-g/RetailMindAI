"""
Smart Discount Decision Tree Training Pipeline (ID3 vs C4.5).
Trains:
1. ID3 (Information Gain) Decision Tree
2. C4.5 (Gain Ratio & Split Information) Decision Tree
Evaluates Accuracy, Precision, Recall, Macro F1, Tree Depth, and Complexity.
Saves model trees and explanation metadata to disk.
"""

import json
import os
import sys
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing.discount_preprocessor import DiscountPreprocessor
from training.decision_trees import ID3DecisionTreeClassifier, C45DecisionTreeClassifier


def generate_discount_dataset(n_samples: int = 600) -> pd.DataFrame:
    """
    Generates realistic supermarket markdown data with defensible domain labeling:
    - 20% discount: Urgently expiring (<=3 days) + Overstock / Normal stock
    - 15% discount: Near expiry (4-14 days) + Overstock + Good margin
    - 10% discount: Slow velocity + Overstock + Safe expiry
    - 5% discount: Moderate velocity + Normal stock + Festive/Monsoon
    - 0% discount: Critical stock (low inventory) OR Fast velocity (high organic demand)
    """
    np.random.seed(42)
    rows = []

    margins = ["LOW", "MEDIUM", "HIGH"]
    stocks = ["CRITICAL", "NORMAL", "OVERSTOCK"]
    velocities = ["SLOW", "MODERATE", "FAST"]
    expiries = ["URGENT", "NEAR", "SAFE"]
    seasons = ["MONSOON", "FESTIVE", "SUMMER", "WINTER"]

    for _ in range(n_samples):
        m = np.random.choice(margins, p=[0.25, 0.45, 0.30])
        st = np.random.choice(stocks, p=[0.20, 0.50, 0.30])
        v = np.random.choice(velocities, p=[0.30, 0.45, 0.25])
        exp = np.random.choice(expiries, p=[0.15, 0.30, 0.55])
        sea = np.random.choice(seasons, p=[0.30, 0.30, 0.20, 0.20])

        # Domain Decision Rules for Target Labeling
        if exp == "URGENT" and st in ["NORMAL", "OVERSTOCK"]:
            discount = 20
        elif exp == "NEAR" and st == "OVERSTOCK" and m in ["MEDIUM", "HIGH"]:
            discount = 15
        elif exp == "NEAR" and st in ["NORMAL", "OVERSTOCK"]:
            discount = 10
        elif v == "SLOW" and st == "OVERSTOCK":
            discount = 10
        elif v == "SLOW" and sea in ["FESTIVE", "MONSOON"] and m == "HIGH":
            discount = 10
        elif st == "NORMAL" and v == "MODERATE" and sea == "FESTIVE":
            discount = 5
        elif st == "CRITICAL" or v == "FAST":
            discount = 0
        else:
            discount = 0

        rows.append({
            "margin_tier": m,
            "stock_level": st,
            "velocity_tier": v,
            "expiry_urgency": exp,
            "season": sea,
            "recommendedDiscount": discount
        })

    return pd.DataFrame(rows)


def train_discount_decision_trees(save_dir: str = "models") -> Dict[str, Any]:
    os.makedirs(save_dir, exist_ok=True)
    print("🚀 [Decision Trees] Initiating ID3 and C4.5 Smart Discount Models Training...")

    df = generate_discount_dataset(n_samples=700)
    features = ["margin_tier", "stock_level", "velocity_tier", "expiry_urgency", "season"]
    X = df[features]
    y = df["recommendedDiscount"]

    classes = [0, 5, 10, 15, 20]
    print(f"📊 Dataset Size: {len(df)} records. Class Frequencies: {dict(y.value_counts())}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 1. Train ID3
    id3_tree = ID3DecisionTreeClassifier(max_depth=5, min_samples_split=3)
    id3_tree.fit(X_train, y_train)
    id3_preds = id3_tree.predict(X_test)

    id3_acc = float(accuracy_score(y_test, id3_preds))
    id3_prec = float(precision_score(y_test, id3_preds, average="macro", zero_division=0))
    id3_rec = float(recall_score(y_test, id3_preds, average="macro", zero_division=0))
    id3_f1 = float(f1_score(y_test, id3_preds, average="macro", zero_division=0))

    # 2. Train C4.5
    c45_tree = C45DecisionTreeClassifier(max_depth=5, min_samples_split=3)
    c45_tree.fit(X_train, y_train)
    c45_preds = c45_tree.predict(X_test)

    c45_acc = float(accuracy_score(y_test, c45_preds))
    c45_prec = float(precision_score(y_test, c45_preds, average="macro", zero_division=0))
    c45_rec = float(recall_score(y_test, c45_preds, average="macro", zero_division=0))
    c45_f1 = float(f1_score(y_test, c45_preds, average="macro", zero_division=0))

    print("\n🔍 [Decision Trees] Algorithm Comparison:")
    print(f"  • ID3  (Information Gain): Acc={round(id3_acc*100, 2)}%, Precision={round(id3_prec*100, 2)}%, Recall={round(id3_rec*100, 2)}%, Macro F1={round(id3_f1*100, 2)}%")
    print(f"  • C4.5 (Gain Ratio)     : Acc={round(c45_acc*100, 2)}%, Precision={round(c45_prec*100, 2)}%, Recall={round(c45_rec*100, 2)}%, Macro F1={round(c45_f1*100, 2)}%")

    # Serialize both models & metadata
    id3_path = os.path.join(save_dir, "discount_id3_model.pkl")
    c45_path = os.path.join(save_dir, "discount_c45_model.pkl")
    metadata_path = os.path.join(save_dir, "discount_metadata.json")

    joblib.dump(id3_tree, id3_path)
    joblib.dump(c45_tree, c45_path)

    metadata = {
        "modelName": "smart-discount-decision-trees",
        "modelVersion": "1.0.0",
        "features": features,
        "classes": classes,
        "id3Metrics": {
            "algorithm": "ID3 (Shannon Entropy + Information Gain)",
            "accuracy": round(id3_acc, 4),
            "precision": round(id3_prec, 4),
            "recall": round(id3_rec, 4),
            "macroF1": round(id3_f1, 4),
            "rootAttribute": id3_tree.root.attribute if id3_tree.root else None
        },
        "c45Metrics": {
            "algorithm": "C4.5 (Gain Ratio + Split Information)",
            "accuracy": round(c45_acc, 4),
            "precision": round(c45_prec, 4),
            "recall": round(c45_rec, 4),
            "macroF1": round(c45_f1, 4),
            "rootAttribute": c45_tree.root.attribute if c45_tree.root else None
        },
        "id3TreeStructure": id3_tree.root.to_dict() if id3_tree.root else {},
        "c45TreeStructure": c45_tree.root.to_dict() if c45_tree.root else {}
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"💾 Decision tree models saved to '{save_dir}/': discount_id3_model.pkl, discount_c45_model.pkl, discount_metadata.json\n")
    return metadata


if __name__ == "__main__":
    train_discount_decision_trees()
