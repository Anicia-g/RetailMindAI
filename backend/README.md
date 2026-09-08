# RetailMind AI — Node.js & Express REST Backend

Production-grade Node.js and Express REST API backend with MongoDB, Role-Based Access Control (RBAC), and Machine Learning service boundaries for the **RetailMind AI** supermarket & retail management platform.

---

## Architecture Overview

```
Frontend (Next.js 14 Client)
   │
   ▼
Express REST API (Port 5000)
   ├── Security: Helmet, CORS, RateLimit, JWT Verification, Role Guards
   ├── Domain Services: POS, Inventory, Products, Customers, Suppliers, Orders
   ├── ML Services: K-Means (RFM), ARIMA Demand Forecasting, ID3/C4.5 Decision Trees
   └── External Gateways: OTP Service, WhatsApp Business API, AI Assistant
   │
   ▼
MongoDB (Mongoose ODM)
   └── Collections: users, stores, categories, products, inventory, stocktransactions,
                    customers, orders, payments, suppliers, purchaseorders, settings, otps
```

---

## 3 Primary System Roles & Access Control

| Role | Default Email | Password | Accessible Endpoints & UI |
|---|---|---|---|
| **ADMIN** | `admin@retailmind.ai` | `admin1234` | `/api/admin/*`, `/api/products` (CRUD), `/api/suppliers`, `/api/purchase-orders`, `/api/analytics`, `/api/reports`, `/api/settings` |
| **SELLER** | `seller@retailmind.ai` | `seller1234` | `/api/seller/*`, `/api/seller/sales` (POS), `/api/seller/products`, `/api/seller/best-customer`, `/api/seller/inventory` |
| **CUSTOMER** | `customer@retailmind.ai` | `customer1234` | `/api/customer/*`, `/api/recommendations`, `/api/orders` (Online cart checkout), `/api/ai/chat` (Grocery safe mode) |

---

## Quickstart & Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/retailmind_ai
JWT_SECRET=retailmind_jwt_super_secret_key_2026_production_grade
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
OTP_EXPIRY_MINUTES=10
OTP_DEV_AUTO_VERIFY=true
```

### 3. Seed Database
Seed all demo accounts, stores, categories, products, customers with RFM history, purchase orders, and inventory:
```bash
npm run seed
```

### 4. Start Server
```bash
npm start
# or for live-reload dev mode:
npm run dev
```
API will be live at `http://localhost:5000/api`.

### 5. Run Automated Tests
```bash
npm test
```

---

## Core API Endpoints

### 🔐 Authentication & OTP
- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve active user profile
- `POST /api/auth/send-otp` — Generate secure 6-digit OTP (TTL: 10 mins)
- `POST /api/auth/verify-otp` — Validate one-time code
- `POST /api/auth/reset-password` — Reset password using verified OTP

### 🛒 Products & Catalog
- `GET /api/products` — Paginated catalog with search, category, brand, stock filters
- `GET /api/products/:id` — Product details
- `POST /api/products` *(Admin)* — Create new product
- `PUT /api/products/:id` *(Admin/Seller)* — Update product details
- `DELETE /api/products/:id` *(Admin)* — Soft-delete product
- `PATCH /api/products/:id/discount` *(Admin/Seller)* — Update promotional discount

### 🏪 Seller Shift Terminal & POS
- `GET /api/seller/profile` — Seller profile and quota status
- `GET /api/seller/dashboard` — Shift KPIs, sales pacing, low-stock alerts
- `GET /api/seller/products` — Store-filtered products
- `GET /api/seller/best-sellers` — Top-selling products in store
- `GET /api/seller/best-customer` — Calculated top customer by LTV & frequency
- `POST /api/seller/sales` — Execute atomic POS sale: validates stock, creates order & payment, decrements inventory, logs stock transaction

### 📦 Inventory & Stock Movement
- `GET /api/inventory` *(Admin/Seller)* — Full inventory records & risk thresholds
- `GET /api/inventory/transactions` *(Admin/Seller)* — Immutable stock movement audit ledger
- `POST /api/inventory/adjust` *(Admin/Seller)* — Manual stock adjustments with reason logging

### 🤖 Machine Learning & Intelligence Endpoints
- `GET /api/ml/customer-segmentation` — K-Means (k=4) clustering over normalized RFM features (`VIP`, `Loyal`, `Growing`, `At Risk`)
- `GET /api/ml/forecast/:productId?days=14` — ARIMA / Holt-Winters demand forecast time series with confidence bounds
- `GET /api/ml/inventory-risk` — Stock-out probability & reorder recommendation engine
- `POST /api/ml/discount-recommendation` — ID3 / C4.5 Decision Tree classification for optimal discount markdown

### 💬 Role-Aware AI Assistant
- `POST /api/ai/chat` — Contextual AI query:
  - **Admin**: Cross-store stock balancing, supplier performance, business diagnostics.
  - **Seller**: Shift pacing, aisle alerts, fast-selling SKUs, best customer lookup.
  - **Customer**: Recipe recommendations, grocery deals, order tracking (strictly blocks internal margins & supplier costs).

### 📱 Notifications
- `POST /api/notifications/whatsapp/offers` — WhatsApp Business API offer notification dispatcher
