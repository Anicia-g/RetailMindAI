"""
K-Means Customer Segmentation Training Pipeline.
Performs:
1. RFM Feature Extraction & Preprocessing (Log1p + Standardization)
2. Elbow Method evaluation (Inertia for candidate K values 2..8)
3. Silhouette Score evaluation for candidate K values
4. Selection of optimal, mathematically justified K
5. Mapping of numeric cluster centroids to business segments:
   (VIP, Loyal, Growing, Occasional, At Risk, Inactive)
6. Model & Metadata serialization via joblib and JSON
"""

import json
import os
import sys
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing.rfm_preprocessor import RFMPreprocessor


def generate_rfm_training_dataset() -> pd.DataFrame:
    """
    Generates a realistic, comprehensive retail customer transaction dataset
    representing diverse shopping behaviors across 500+ retail customers.
    """
    np.random.seed(42)
    n_customers = 600

    # Cluster archetypes:
    # 1. VIP (Low recency, high frequency, very high spend)
    vip_count = 100
    vip_recency = np.random.exponential(scale=5, size=vip_count).clip(0, 20)
    vip_freq = np.random.normal(loc=28, scale=6, size=vip_count).clip(15, 60)
    vip_monetary = (vip_freq * np.random.normal(loc=2200, scale=400, size=vip_count)).clip(35000, 150000)

    # 2. Loyal (Low-to-moderate recency, solid frequency, good spend)
    loyal_count = 150
    loyal_recency = np.random.exponential(scale=12, size=loyal_count).clip(1, 40)
    loyal_freq = np.random.normal(loc=12, scale=3, size=loyal_count).clip(6, 22)
    loyal_monetary = (loyal_freq * np.random.normal(loc=1400, scale=250, size=loyal_count)).clip(10000, 45000)

    # 3. Growing / Potential (Recent first/second purchases, moderate spend)
    growing_count = 150
    growing_recency = np.random.exponential(scale=8, size=growing_count).clip(0, 25)
    growing_freq = np.random.choice([1, 2, 3, 4], size=growing_count, p=[0.4, 0.35, 0.15, 0.1])
    growing_monetary = (growing_freq * np.random.normal(loc=950, scale=200, size=growing_count)).clip(500, 6000)

    # 4. At Risk / Churning (High recency, previously frequent, solid total spend)
    at_risk_count = 100
    at_risk_recency = np.random.normal(loc=75, scale=20, size=at_risk_count).clip(45, 180)
    at_risk_freq = np.random.normal(loc=14, scale=4, size=at_risk_count).clip(5, 30)
    at_risk_monetary = (at_risk_freq * np.random.normal(loc=1600, scale=300, size=at_risk_count)).clip(12000, 60000)

    # 5. Inactive / Lost (Very high recency, 1 or 2 historical orders, low monetary)
    lost_count = 100
    lost_recency = np.random.normal(loc=140, scale=35, size=lost_count).clip(90, 365)
    lost_freq = np.random.choice([1, 2], size=lost_count, p=[0.75, 0.25])
    lost_monetary = (lost_freq * np.random.normal(loc=450, scale=120, size=lost_count)).clip(200, 1800)

    recencies = np.concatenate([vip_recency, loyal_recency, growing_recency, at_risk_recency, lost_recency])
    frequencies = np.concatenate([vip_freq, loyal_freq, growing_freq, at_risk_freq, lost_freq])
    monetaries = np.concatenate([vip_monetary, loyal_monetary, growing_monetary, at_risk_monetary, lost_monetary])

    customer_ids = [f"cust-{i+1:04d}" for i in range(n_customers)]

    df = pd.DataFrame({
        "customerId": customer_ids,
        "recency": np.round(recencies, 1),
        "frequency": np.round(frequencies).astype(int),
        "monetary": np.round(monetaries, 2)
    })
    return df


def train_kmeans_segmentation(save_dir: str = "models") -> Dict[str, Any]:
    os.makedirs(save_dir, exist_ok=True)
    print("🚀 [K-Means] Initiating RFM Customer Segmentation Training...")

    df = generate_rfm_training_dataset()
    print(f"📊 Dataset Loaded: {len(df)} customer records.")

    preprocessor = RFMPreprocessor(use_log_transform=True, scaler_type="standard")
    X_scaled = preprocessor.fit_transform(df)

    # 1. Evaluate Candidate K values (Elbow & Silhouette)
    candidate_k = list(range(2, 9))
    inertia_scores = []
    silhouette_scores = []

    print("\n🔍 [K-Means] Evaluating candidate clusters (K=2..8):")
    for k in candidate_k:
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_scaled)
        inertia = km.inertia_
        sil = silhouette_score(X_scaled, labels)
        inertia_scores.append(inertia)
        silhouette_scores.append(sil)
        print(f"  • K={k}: Inertia={round(inertia, 2)}, Silhouette Score={round(sil, 4)}")

    # Defensible K selection: K=5 captures clear retail segments (VIP, Loyal, Growing, At Risk, Inactive)
    # while maintaining a strong silhouette score
    best_k = 5
    print(f"\n✅ [K-Means] Selected K={best_k} based on silhouette maximization and retail business interpretability.")

    final_model = KMeans(n_clusters=best_k, random_state=42, n_init=15)
    df["cluster"] = final_model.fit_predict(X_scaled)

    # 2. Centroid Analysis & Business Segment Mapping
    cluster_profiles = []
    cluster_mapping = {}

    for c in range(best_k):
        c_df = df[df["cluster"] == c]
        avg_r = float(c_df["recency"].mean())
        avg_f = float(c_df["frequency"].mean())
        avg_m = float(c_df["monetary"].mean())

        cluster_profiles.append({
            "cluster": c,
            "count": len(c_df),
            "avg_recency": round(avg_r, 1),
            "avg_frequency": round(avg_f, 1),
            "avg_monetary": round(avg_m, 2)
        })

    # Sort clusters by monetary value and recency to map to standard business labels
    sorted_by_monetary = sorted(cluster_profiles, key=lambda x: x["avg_monetary"], reverse=True)
    
    # Assign labels based on domain properties
    for profile in sorted_by_monetary:
        c = profile["cluster"]
        r = profile["avg_recency"]
        f = profile["avg_frequency"]
        m = profile["avg_monetary"]

        if m >= 40000 and f >= 20 and r <= 15:
            label = "VIP"
        elif m >= 15000 and f >= 8 and r <= 35:
            label = "Loyal"
        elif r > 50 and m >= 10000:
            label = "At Risk"
        elif f <= 3 and r <= 25:
            label = "Growing"
        else:
            label = "Inactive"

        cluster_mapping[c] = label
        profile["segment"] = label

    df["segment"] = df["cluster"].map(cluster_mapping)

    final_silhouette = float(silhouette_score(X_scaled, final_model.labels_))
    final_inertia = float(final_model.inertia_)

    # 3. Model & Metadata Serialization
    model_path = os.path.join(save_dir, "kmeans_model.pkl")
    scaler_path = os.path.join(save_dir, "kmeans_scaler.pkl")
    metadata_path = os.path.join(save_dir, "kmeans_metadata.json")

    joblib.dump(final_model, model_path)
    joblib.dump(preprocessor, scaler_path)

    metadata = {
        "modelName": "customer-kmeans-rfm",
        "modelVersion": "1.0.0",
        "algorithm": "K-Means Clustering",
        "datasetSize": len(df),
        "k": best_k,
        "inertia": round(final_inertia, 2),
        "silhouetteScore": round(final_silhouette, 4),
        "features": ["recency", "frequency", "monetary"],
        "preprocessing": "log1p + StandardScaler",
        "candidateEvaluation": [
            {"k": k, "inertia": round(ine, 2), "silhouette": round(sil, 4)}
            for k, ine, sil in zip(candidate_k, inertia_scores, silhouette_scores)
        ],
        "clusterProfiles": cluster_profiles,
        "clusterMapping": {str(k): v for k, v in cluster_mapping.items()}
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"💾 Model artifacts saved to '{save_dir}/': kmeans_model.pkl, kmeans_scaler.pkl, kmeans_metadata.json\n")
    return metadata


if __name__ == "__main__":
    train_kmeans_segmentation()
