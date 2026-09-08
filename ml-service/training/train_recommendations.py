"""
Product Recommendation & Co-Purchase Association Mining Training Pipeline.
Computes:
1. Product Co-occurrence Matrix from multi-item basket transactions
2. Conditional association confidence: P(B | A) = Count(A, B) / Count(A)
3. Category affinity scoring for personalized customer recommendations
4. Serialization of recommendation tables to disk
"""

import json
import os
import sys
from collections import defaultdict
from typing import Dict, Any, List, Tuple
import joblib
import pandas as pd
import numpy as np


def generate_basket_orders() -> List[List[str]]:
    """
    Generates realistic supermarket baskets exhibiting strong retail associations:
    - Milk (prod-001) + Bread (prod-002) + Yogurt (prod-004)
    - Rice (prod-003) + Olive Oil (prod-005)
    - Coffee / Tea + Cookies / Snacks (prod-006)
    """
    np.random.seed(42)
    baskets = []
    n_orders = 800

    catalog = ["prod-001", "prod-002", "prod-003", "prod-004", "prod-005", "prod-006"]

    for _ in range(n_orders):
        basket_type = np.random.choice(["breakfast", "pantry", "snack", "mixed"], p=[0.40, 0.25, 0.20, 0.15])
        if basket_type == "breakfast":
            items = ["prod-001", "prod-002"]
            if np.random.rand() > 0.35:
                items.append("prod-004")
        elif basket_type == "pantry":
            items = ["prod-003"]
            if np.random.rand() > 0.40:
                items.append("prod-005")
        elif basket_type == "snack":
            items = ["prod-006"]
            if np.random.rand() > 0.50:
                items.append("prod-001")
        else:
            size = np.random.randint(2, 5)
            items = list(np.random.choice(catalog, size=size, replace=False))

        baskets.append(items)

    return baskets


def train_recommendation_system(save_dir: str = "models") -> Dict[str, Any]:
    os.makedirs(save_dir, exist_ok=True)
    print("🚀 [Recommendations] Mining Product Basket Associations & Co-occurrence Matrix...")

    baskets = generate_basket_orders()
    item_counts = defaultdict(int)
    pair_counts = defaultdict(lambda: defaultdict(int))

    for basket in baskets:
        unique_items = list(set(basket))
        for item in unique_items:
            item_counts[item] += 1

        for i in range(len(unique_items)):
            for j in range(len(unique_items)):
                if i != j:
                    item_a = unique_items[i]
                    item_b = unique_items[j]
                    pair_counts[item_a][item_b] += 1

    # Build association lookup table: product_a -> list of (product_b, confidence, co_count)
    frequently_bought_together = {}
    total_baskets = len(baskets)

    for item_a, neighbors in pair_counts.items():
        ranked_neighbors = []
        count_a = item_counts[item_a]

        for item_b, co_count in neighbors.items():
            confidence = co_count / max(1, count_a)
            count_b = item_counts[item_b]
            # Lift = P(A, B) / (P(A) * P(B))
            lift = (co_count / total_baskets) / ((count_a / total_baskets) * (count_b / total_baskets))

            ranked_neighbors.append({
                "productId": item_b,
                "coOccurrenceCount": co_count,
                "confidence": round(confidence, 4),
                "lift": round(lift, 2)
            })

        ranked_neighbors.sort(key=lambda x: x["confidence"], reverse=True)
        frequently_bought_together[item_a] = ranked_neighbors

    # Product Metadata Catalog
    product_catalog = {
        "prod-001": {"name": "Farm Fresh Milk 1L (Whole)", "category": "Dairy & Eggs", "price": 58},
        "prod-002": {"name": "Artisan Whole Wheat Sourdough Bread", "category": "Bakery & Snacks", "price": 95},
        "prod-003": {"name": "Royal Basmati Rice 5kg", "category": "Rice & Grains", "price": 540},
        "prod-004": {"name": "Greek Probiotic Natural Yogurt 500g", "category": "Dairy & Eggs", "price": 135},
        "prod-005": {"name": "Organic Cold-Pressed Extra Virgin Olive Oil 500ml", "category": "Cooking Oils & Ghee", "price": 849},
        "prod-006": {"name": "Gourmet Dark Chocolate & Hazelnut Cookies 200g", "category": "Bakery & Snacks", "price": 145},
    }

    model_payload = {
        "item_counts": dict(item_counts),
        "frequently_bought_together": frequently_bought_together,
        "product_catalog": product_catalog,
        "total_baskets": total_baskets
    }

    model_path = os.path.join(save_dir, "recommendations_model.pkl")
    metadata_path = os.path.join(save_dir, "recommendations_metadata.json")

    joblib.dump(model_payload, model_path)

    metadata = {
        "modelName": "basket-recommendation-engine",
        "modelVersion": "1.0.0",
        "algorithm": "Item-Item Co-occurrence Association Mining",
        "totalBasketsAnalyzed": total_baskets,
        "topAssociations": {
            k: v[:2] for k, v in frequently_bought_together.items()
        }
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"💾 Recommendations model saved to '{save_dir}/': recommendations_model.pkl, recommendations_metadata.json\n")
    return metadata


if __name__ == "__main__":
    train_recommendation_system()
