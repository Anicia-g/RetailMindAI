"""
Unit & Integration Test Suite for RetailMind AI ML Service.
Validates all 6 ML prediction engines and FastAPI REST endpoints.
"""

import sys
import os
import unittest
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app import app


class TestMLService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("customer-segmentation-kmeans", data["modelsLoaded"])
        print("  ✅ [PASS] GET /health returns 200 and loaded models list")

    def test_02_customer_segmentation_single(self):
        payload = {
            "customerId": "cust-001",
            "recency": 2.0,
            "frequency": 28.0,
            "monetary": 68000.0
        }
        res = self.client.post("/customer-segmentation/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["segment"], "VIP")
        self.assertIn("confidenceScore", data["data"])
        print(f"  ✅ [PASS] POST /customer-segmentation/predict -> Segment: {data['data']['segment']}, Score: {data['data']['confidenceScore']}")

    def test_03_customer_segmentation_batch(self):
        payload = {
            "customers": [
                {"customerId": "c1", "recency": 2.0, "frequency": 30.0, "monetary": 80000.0},
                {"customerId": "c2", "recency": 80.0, "frequency": 12.0, "monetary": 22000.0},
                {"customerId": "c3", "recency": 5.0, "frequency": 2.0, "monetary": 1200.0}
            ]
        }
        res = self.client.post("/customer-segmentation/batch-predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["data"]), 3)
        print(f"  ✅ [PASS] POST /customer-segmentation/batch-predict -> {len(data['data'])} customers scored")

    def test_04_demand_forecast(self):
        payload = {
            "productId": "prod-001",
            "storeId": "store-01",
            "horizon": 14
        }
        res = self.client.post("/forecast/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(len(data["data"]["timeSeries"]), 14)
        self.assertIn("algorithm", data["data"])
        print(f"  ✅ [PASS] POST /forecast/predict -> Algorithm: {data['data']['algorithm']}, 14 days forecasted")

    def test_05_inventory_risk_single(self):
        payload = {
            "productId": "prod-004",
            "productName": "Greek Probiotic Natural Yogurt 500g",
            "storeId": "store-01",
            "currentStock": 6.0,
            "reorderLevel": 40.0,
            "dailySalesVelocity": 12.0,
            "expiryDays": 2.0
        }
        res = self.client.post("/inventory-risk/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["riskLevel"], "HIGH")
        self.assertTrue(len(data["data"]["importantFactors"]) > 0)
        print(f"  ✅ [PASS] POST /inventory-risk/predict -> Risk: {data['data']['riskLevel']}, Factors: {data['data']['importantFactors'][0]}")

    def test_06_smart_discount_id3_and_c45(self):
        # 1. C4.5
        payload_c45 = {
            "productId": "prod-002",
            "storeId": "store-01",
            "margin": 38.0,
            "stock": 60.0,
            "velocity": 3.0,
            "expiryDays": 2.0,
            "season": "MONSOON",
            "model": "C4.5"
        }
        res_c45 = self.client.post("/discount/predict", json=payload_c45)
        self.assertEqual(res_c45.status_code, 200)
        data_c45 = res_c45.json()
        self.assertEqual(data_c45["data"]["modelUsed"], "C4.5")
        self.assertGreaterEqual(data_c45["data"]["recommendedDiscount"], 10)

        # 2. ID3
        payload_id3 = payload_c45.copy()
        payload_id3["model"] = "ID3"
        res_id3 = self.client.post("/discount/predict", json=payload_id3)
        self.assertEqual(res_id3.status_code, 200)
        data_id3 = res_id3.json()
        self.assertEqual(data_id3["data"]["modelUsed"], "ID3")
        print(f"  ✅ [PASS] POST /discount/predict -> C4.5: {data_c45['data']['discountFormatted']} | ID3: {data_id3['data']['discountFormatted']}")

    def test_07_recommendations(self):
        res_assoc = self.client.post("/recommendations/frequently-bought-together", json={"productId": "prod-001", "limit": 3})
        self.assertEqual(res_assoc.status_code, 200)
        data_assoc = res_assoc.json()
        self.assertTrue(len(data_assoc["data"]["recommendations"]) > 0)

        res_pers = self.client.post("/recommendations/personalized", json={"customerId": "cust-001", "limit": 3})
        self.assertEqual(res_pers.status_code, 200)
        print(f"  ✅ [PASS] POST /recommendations/* -> {len(data_assoc['data']['recommendations'])} associated items found")

    def test_08_anomaly_detection(self):
        # Normal transaction
        normal_res = self.client.post("/anomaly-detection/predict", json={
            "transactionId": "tx-001",
            "totalAmount": 1250.0,
            "itemCount": 5,
            "hourOfDay": 15,
            "discountPct": 5.0
        })
        self.assertEqual(normal_res.status_code, 200)
        self.assertFalse(normal_res.json()["data"]["isAnomaly"])

        # Anomalous transaction: Rs 48,000 checkout with 65 items at 3:00 AM
        anomaly_res = self.client.post("/anomaly-detection/predict", json={
            "transactionId": "tx-999",
            "totalAmount": 48000.0,
            "itemCount": 65,
            "hourOfDay": 3,
            "discountPct": 40.0
        })
        self.assertEqual(anomaly_res.status_code, 200)
        self.assertTrue(anomaly_res.json()["data"]["isAnomaly"])
        print(f"  ✅ [PASS] POST /anomaly-detection/predict -> Normal: False | Suspicious: True (Score: {anomaly_res.json()['data']['anomalyScore']})")

    def test_09_models_performance_metadata(self):
        res = self.client.get("/models/performance")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("customerSegmentation", data["data"])
        self.assertIn("demandForecasting", data["data"])
        self.assertIn("inventoryRisk", data["data"])
        self.assertIn("discountDecisionTrees", data["data"])
        print("  ✅ [PASS] GET /models/performance -> All model evaluation summaries loaded")


if __name__ == "__main__":
    print("\n🔄 Running ML Service Unit & Integration Tests...")
    suite = unittest.TestLoader().loadTestsFromTestCase(TestMLService)
    runner = unittest.TextTestRunner(verbosity=1)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
