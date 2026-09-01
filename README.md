# 🛒 RetailMind AI — Intelligent Retail Decisions & Enterprise BI Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-indigo?style=flat-square)](#)

**RetailMind AI** is an end-to-end, multi-tenant enterprise retail operations and predictive intelligence platform. Built with Next.js 14 App Router, it unifies multi-store inventory synchronization, POS retail sales, machine learning intelligence (Demand Forecasting, Smart Discounts, Customer Clustering), and role-based experiences for **Executives / Admins**, **Store Sellers**, and **End Customers**.

---

## 🌟 Key Highlights & Architecture

### 1. 👥 Tri-Role Multi-Tenant Access Control (RBAC)
- **👑 Admin / Executive**:
  - Full operational control over multi-store networks, global catalog, purchase orders, financial reports, employee leaderboards, and AI diagnostics.
- **🏪 Store Seller**:
  - Shift dashboard, instant Point-of-Sale (POS) sale recording, local store inventory health alerts, best-selling product tracking, quota achievement gauges, and customer loyalty insights.
- **🛍️ Customer / Buyer**:
  - Supermarket grocery storefront with dynamic deals, frequently bought together AI bundles, persistent shopping cart, wishlist, multi-category browsing, and order tracking.

### 2. 🤖 Retail Machine Learning & Intelligence Suite
- **📈 Demand Forecasting**: Multi-horizon (`7d`, `14d`, `30d`) predictive models (ARIMA + Seasonal Holt-Winters) with confidence intervals and automatic purchase order triggers.
- **🏷️ Smart Discount Engine (ID3 & C4.5)**: Automated decision tree-driven markdown recommendations analyzing inventory shelf life, expiration windows, and sales velocity to optimize margins and eliminate spoilage.
- **👥 Customer Segmentation (K-Means & RFM)**: Automated cluster classification (Champions, Loyalists, At Risk, Promising) driving targeted promotions and retention workflows.
- **💬 Conversational AI Business Copilot**: Context-aware drawer and dedicated AI terminal providing real-time diagnostics, stockout risk alerts, root-cause explanations for sales trends, and 1-click PO generation.

### 3. 🌐 Enterprise Usability & Theming
- **Multi-Language (i18n)**: Instant localized interface supporting **English (`en`)**, **Tamil (`ta`)**, and **Hindi (`hi`)**.
- **Adaptive Theme Engine**: Dynamic dark/light mode toggle with granular custom background, font color, and typography sizing controls persisted across sessions.

---

## 📂 Project Directory Structure

```
retailmind/
├── src/
│   ├── app/                                 # Next.js 14 App Router
│   │   ├── (app)/                           # Authenticated workspace layout group
│   │   │   ├── ai-assistant/page.jsx        # Conversational AI Intelligence Center
│   │   │   ├── analytics/page.jsx           # Enterprise Sales & KPI Analytics
│   │   │   ├── customers/page.jsx           # Customer CRM & RFM Segmentation
│   │   │   ├── dashboard/page.jsx           # Admin Command Center Dashboard
│   │   │   ├── employees/page.jsx           # Staff Performance & Shift Quotas
│   │   │   ├── forecasting/page.jsx         # ARIMA Demand Forecasting
│   │   │   ├── inventory/page.jsx           # Multi-Store Inventory Matrix & Stock Audit
│   │   │   ├── layout.jsx                   # Role-Based Routing & Session Guard
│   │   │   ├── payments/page.jsx            # Transaction Logs & Gateway Breakdown
│   │   │   ├── products/page.jsx            # Product Catalog & SKU Management
│   │   │   ├── purchase-orders/page.jsx     # PO Procurement & Supplier Invoicing
│   │   │   ├── reports/page.jsx             # Financial, Margin & Spoilage Audits
│   │   │   ├── sales/page.jsx               # Sales Ledger & Real-time POS Transactions
│   │   │   ├── seller/page.jsx              # Seller Shift Terminal & POS Dashboard
│   │   │   ├── settings/page.jsx            # App Personalization, Theme & Language
│   │   │   ├── shop/page.jsx                # Customer Supermarket Storefront
│   │   │   ├── stores/page.jsx              # Multi-Location Store Management
│   │   │   └── suppliers/page.jsx           # Vendor Directory & Lead-Time Tracking
│   │   ├── api/auth/login/route.js          # JWT Credentials Authentication API
│   │   ├── globals.css                      # Global Styles & Dynamic CSS Variables
│   │   ├── layout.jsx                       # Root HTML Layout & Context Providers
│   │   ├── loading.jsx                      # Global Fallback Skeleton Loader
│   │   ├── login/page.jsx                   # Role Selector & Login Screen
│   │   └── page.jsx                         # Root Role Dispatcher
│   │
│   ├── components/                          # Modular React Components
│   │   ├── analytics/                       # Leaderboards & KPI Section Components
│   │   │   ├── BestSellingProducts.jsx
│   │   │   ├── CustomerIntelligenceSection.jsx
│   │   │   ├── SmartDiscountSection.jsx
│   │   │   ├── StarSellersLeaderboard.jsx
│   │   │   └── TopCustomersLeaderboard.jsx
│   │   ├── charts/                          # Responsive Data Visualizations
│   │   │   ├── CategoryChart.jsx
│   │   │   ├── CustomerSegmentChart.jsx
│   │   │   ├── ForecastChart.jsx
│   │   │   ├── InventoryChart.jsx
│   │   │   └── SalesChart.jsx
│   │   ├── common/                          # Reusable UI Design System
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── Table.jsx
│   │   ├── customer/                        # Supermarket Storefront Components
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── CategoryList.jsx
│   │   │   ├── DealsSection.jsx
│   │   │   ├── FrequentlyBoughtTogether.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── SupermarketHero.jsx
│   │   ├── intelligence/                    # AI Modals, Drawers & Diagnostic Cards
│   │   │   ├── AIAssistantDrawer.jsx
│   │   │   ├── BestCustomerCard.jsx
│   │   │   ├── CustomerClusteringModal.jsx
│   │   │   ├── CustomerDetailModal.jsx
│   │   │   ├── DiscountAnalysisModal.jsx
│   │   │   ├── ProductIntelligenceModal.jsx
│   │   │   ├── PurchaseOrderModal.jsx
│   │   │   └── SmartDiscountCard.jsx
│   │   └── layout/                          # App Shells, Navigation & POS Modals
│   │       ├── AdminLayout.jsx
│   │       ├── CustomerLayout.jsx
│   │       ├── CustomerNavbar.jsx
│   │       ├── MainLayout.jsx
│   │       ├── Navbar.jsx
│   │       ├── RecordSaleModal.jsx
│   │       ├── SellerLayout.jsx
│   │       ├── SellerNavbar.jsx
│   │       ├── SellerSidebar.jsx
│   │       └── Sidebar.jsx
│   │
│   ├── context/                             # Global State Contexts
│   │   ├── AppSettingsContext.jsx           # Theme, Language (i18n), & Font Controls
│   │   ├── AuthContext.jsx                  # JWT Session, Role Switching, Cart & Wishlist
│   │   └── ThemeContext.jsx                 # Dark/Light Mode Helper
│   │
│   ├── data/                                # Mock Datasets & AI Seed Responses
│   │   ├── aiResponses.js                   # Natural Language AI Rules & Responses
│   │   ├── analytics.js                     # Sales trends, store benchmarks
│   │   ├── categories.js                    # Supermarket taxonomy & multi-lingual tags
│   │   ├── customers.js                     # Customer records & K-Means cluster data
│   │   ├── deals.js                         # Promotional discounts & bundle offers
│   │   ├── employees.js                     # Sales reps, shift data, quota metrics
│   │   ├── forecasting.js                   # Multi-horizon demand curves
│   │   ├── inventory.js                     # Multi-store SKU stock records
│   │   ├── payments.js                      # Gateway logs (UPI, Card, Cash)
│   │   ├── products.js                      # 48+ SKUs with prices, velocities, discounts
│   │   ├── purchaseOrders.js                # PO ledger & procurement statuses
│   │   ├── sales.js                         # POS receipt logs & line items
│   │   ├── stores.js                        # Retail outlet locations & managers
│   │   └── suppliers.js                     # Vendor lead times & contact profiles
│   │
│   ├── lib/                                 # Utilities & Helpers
│   │   ├── auth.js                          # BCrypt hashing, JWT generation & verification
│   │   ├── images.js                        # Curated Unsplash images for products & avatars
│   │   └── translations.js                  # Complete dictionary for EN, TA, HI
│   │
│   └── services/                            # Decoupled Business Logic & API Layer
│       ├── customerService.js               # Customer RFM & store analytics queries
│       ├── discountService.js               # ID3/C4.5 decision tree recommendation logic
│       └── productService.js                # Product queries & discount application
│
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository / open project directory**:
   ```bash
   cd retailmind
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Demo User Accounts & Roles

The system comes pre-configured with 3 role accounts accessible via 1-click on the login page:

| Role | Name | Email | Password | Landing Page |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Admin** | Admin Superuser | `admin@retailmind.ai` | `admin1234` | `/dashboard` |
| **🏪 Seller** | Priya Sharma | `seller@retailmind.ai` | `seller1234` | `/seller` |
| **🛍️ Customer** | Vikram Malhotra | `customer@retailmind.ai` | `customer1234` | `/shop` |

> *Tip: You can instantly switch between roles at any time using the quick role switcher in the top navigation bar or user profile dropdown.*

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Client & Server Components)
- **UI & Styling**: [React 18](https://react.dev/), [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Security & Auth**: [BCrypt.js](https://www.npmjs.com/package/bcryptjs), [JSON Web Tokens (JWT)](https://www.npmjs.com/package/jsonwebtoken)
- **Design Tokens**: Dynamic CSS custom properties with real-time DOM variable binding
- **Internationalization**: Zero-dependency dynamic dictionary supporting English, Tamil, Hindi

---

## 📄 License & Status
Internal Proprietary Enterprise Software.
All operational modules, AI diagnostics, and role workspaces are fully functional and ready for continued development.
