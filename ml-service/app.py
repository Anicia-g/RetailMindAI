"""
RetailMind AI — Python Machine Learning Microservice (FastAPI).
Exposes REST prediction endpoints for:
1. Customer Segmentation (RFM + K-Means)
2. Demand Forecasting (ARIMA & Holt-Winters)
3. Inventory Risk Prediction (Supervised Classification)
4. Smart Discount Recommendation (ID3 & C4.5 Decision Trees)
5. Product Recommendations (Co-occurrence & Personalization)
6. Transaction Anomaly Detection (Isolation Forest)
"""

import os
import sys
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.ml_service_manager import MLServiceManager

app = FastAPI(
    title="RetailMind AI — Machine Learning Service",
    description="Enterprise Data Science & ML Inference Engine for Supermarkets & Retail",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Manager
ml_manager = MLServiceManager.get_instance(models_dir=os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"))


# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class RFMPredictRequest(BaseModel):
    customerId: str = Field(..., example="cust-001")
    recency: float = Field(..., ge=0.0, example=5.0)
    frequency: float = Field(..., ge=1.0, example=12.0)
    monetary: float = Field(..., ge=0.0, example=24500.0)


class RFMBatchRequest(BaseModel):
    customers: List[RFMPredictRequest]


class ForecastRequest(BaseModel):
    productId: str = Field(..., example="prod-001")
    storeId: Optional[str] = Field("store-01", example="store-01")
    horizon: Optional[int] = Field(14, ge=1, le=60, example=14)


class InventoryRiskItem(BaseModel):
    productId: str = Field(..., example="prod-001")
    productName: Optional[str] = Field("Product", example="Farm Fresh Milk 1L")
    storeId: Optional[str] = Field("store-01", example="store-01")
    currentStock: float = Field(..., ge=0.0, example=18.0)
    reorderLevel: Optional[float] = Field(40.0, example=40.0)
    dailySalesVelocity: Optional[float] = Field(5.0, example=8.5)
    weeklySalesVelocity: Optional[float] = None
    monthlySalesVelocity: Optional[float] = None
    daysRemaining: Optional[float] = None
    recentDemand30d: Optional[float] = None
    expiryDays: Optional[float] = Field(90.0, example=4.0)


class InventoryRiskBatchRequest(BaseModel):
    items: List[InventoryRiskItem]


class DiscountRequest(BaseModel):
    productId: str = Field(..., example="prod-004")
    storeId: Optional[str] = Field("store-01", example="store-01")
    margin: float = Field(..., ge=0.0, le=100.0, example=28.5)
    stock: float = Field(..., ge=0.0, example=35.0)
    velocity: float = Field(..., ge=0.0, example=4.5)
    expiryDays: float = Field(..., ge=0.0, example=3.0)
    season: Optional[str] = Field("MONSOON", example="MONSOON")
    model: Optional[str] = Field("C4.5", example="C4.5")


class FrequentlyBoughtTogetherRequest(BaseModel):
    productId: str = Field(..., example="prod-001")
    limit: Optional[int] = Field(4, ge=1, le=10, example=4)


class PersonalizedRecsRequest(BaseModel):
    customerId: str = Field(..., example="cust-001")
    recentCategories: Optional[List[str]] = Field(default_factory=list, example=["Dairy & Eggs", "Bakery & Snacks"])
    limit: Optional[int] = Field(4, ge=1, le=10, example=4)


class AnomalyDetectionRequest(BaseModel):
    transactionId: str = Field(..., example="tx-98214")
    totalAmount: float = Field(..., ge=1.0, example=34500.0)
    itemCount: int = Field(..., ge=1, example=42)
    hourOfDay: Optional[int] = Field(14, ge=0, le=23, example=2)
    discountPct: Optional[float] = Field(0.0, ge=0.0, le=100.0, example=5.0)


# ==========================================
# REST API ENDPOINTS
# ==========================================

@app.get("/health", summary="ML Service Health Probe")
def health_check():
    return {
        "status": "ok",
        "service": "retailmind-ml",
        "version": "1.0.0",
        "modelsLoaded": [
            "customer-segmentation-kmeans",
            "demand-forecasting-arima-holtwinters",
            "inventory-risk-gradientboosting",
            "smart-discount-id3-c45",
            "product-recommendations-copurchase",
            "transaction-anomaly-isolationforest"
        ]
    }


@app.post("/customer-segmentation/predict", summary="Customer RFM K-Means Segmentation")
def predict_customer_segment(req: RFMPredictRequest):
    try:
        res = ml_manager.kmeans.predict_single(
            customer_id=req.customerId,
            recency=req.recency,
            frequency=req.frequency,
            monetary=req.monetary
        )
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/customer-segmentation/batch-predict", summary="Batch Customer RFM Segmentation")
def predict_batch_customer_segments(req: RFMBatchRequest):
    try:
        raw_list = [c.model_dump() for c in req.customers]
        results = ml_manager.kmeans.predict_batch(raw_list)
        return {"success": True, "data": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/forecast/predict", summary="Demand Forecasting (ARIMA / Holt-Winters)")
def predict_demand_forecast(req: ForecastRequest):
    try:
        res = ml_manager.forecast.predict(
            product_id=req.productId,
            store_id=req.storeId or "store-01",
            horizon_days=req.horizon or 14
        )
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/inventory-risk/predict", summary="Single Inventory Stock Risk Assessment")
def predict_inventory_risk_single(req: InventoryRiskItem):
    try:
        res = ml_manager.risk.predict_single(req.model_dump())
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/inventory-risk/batch-predict", summary="Batch Inventory Stock Risk Evaluation")
def predict_inventory_risk_batch(req: InventoryRiskBatchRequest):
    try:
        raw_items = [it.model_dump() for it in req.items]
        results = ml_manager.risk.predict_batch(raw_items)
        return {"success": True, "data": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/discount/predict", summary="Smart Discount Recommendation (ID3 / C4.5)")
def predict_smart_discount(req: DiscountRequest):
    try:
        res = ml_manager.discount.predict(
            product_id=req.productId,
            margin=req.margin,
            stock=req.stock,
            velocity=req.velocity,
            expiry_days=req.expiryDays,
            season=req.season or "MONSOON",
            model_type=req.model or "C4.5"
        )
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/recommendations/frequently-bought-together", summary="Frequently Bought Together Associated Products")
def get_frequently_bought_together(req: FrequentlyBoughtTogetherRequest):
    try:
        res = ml_manager.recommendations.get_frequently_bought_together(
            product_id=req.productId,
            limit=req.limit or 4
        )
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/recommendations/personalized", summary="Personalized Customer Recommendations")
def get_personalized_recommendations(req: PersonalizedRecsRequest):
    try:
        res = ml_manager.recommendations.get_personalized_recommendations(
            customer_id=req.customerId,
            recent_categories=req.recentCategories,
            limit=req.limit or 4
        )
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/anomaly-detection/predict", summary="Transaction Anomaly Scoring (Isolation Forest)")
def predict_transaction_anomaly(req: AnomalyDetectionRequest):
    try:
        res = ml_manager.anomaly.predict(
            transaction_id=req.transactionId,
            total_amount=req.totalAmount,
            item_count=req.itemCount,
            hour_of_day=req.hourOfDay or 14,
            discount_pct=req.discountPct or 0.0
        )
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/models/performance", summary="Model Evaluation & Performance Metrics")
def get_models_performance():
    try:
        metadata = ml_manager.get_all_performance_metadata()
        return {"success": True, "data": metadata}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
