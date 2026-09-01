/**
 * Voice Command Parser
 * Normalizes speech text and maps natural spoken utterances to navigation intents.
 */

export const VOICE_INTENTS = {
  DASHBOARD: 'DASHBOARD',
  PRODUCTS: 'PRODUCTS',
  INVENTORY: 'INVENTORY',
  SALES: 'SALES',
  CUSTOMERS: 'CUSTOMERS',
  SUPPLIERS: 'SUPPLIERS',
  STORES: 'STORES',
  EMPLOYEES: 'EMPLOYEES',
  PURCHASE_ORDERS: 'PURCHASE_ORDERS',
  PAYMENTS: 'PAYMENTS',
  ANALYTICS: 'ANALYTICS',
  FORECASTING: 'FORECASTING',
  AI_ASSISTANT: 'AI_ASSISTANT',
  REPORTS: 'REPORTS',
  SETTINGS: 'SETTINGS',
  // Seller Intents
  SELLER_DASHBOARD: 'SELLER_DASHBOARD',
  SELLER_SALES: 'SELLER_SALES',
  SELLER_PRODUCTS: 'SELLER_PRODUCTS',
  SELLER_INVENTORY: 'SELLER_INVENTORY',
  SELLER_CUSTOMERS: 'SELLER_CUSTOMERS',
  SELLER_PERFORMANCE: 'SELLER_PERFORMANCE',
  SELLER_BEST_SELLERS: 'SELLER_BEST_SELLERS',
  SELLER_REPORTS: 'SELLER_REPORTS',
  SELLER_PROFILE: 'SELLER_PROFILE',
  // Customer Intents
  SHOP_HOME: 'SHOP_HOME',
  SHOP_PRODUCTS: 'SHOP_PRODUCTS',
  SHOP_CATEGORIES: 'SHOP_CATEGORIES',
  SHOP_OFFERS: 'SHOP_OFFERS',
  SHOP_WISHLIST: 'SHOP_WISHLIST',
  SHOP_CART: 'SHOP_CART',
  SHOP_ORDERS: 'SHOP_ORDERS',
  SHOP_PROFILE: 'SHOP_PROFILE',
};

/**
 * Normalizes input speech string by trimming, removing punctuation, and converting to lowercase
 */
export function normalizeSpeechText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses normalized text into a target intent
 */
export function parseVoiceCommand(rawSpeech) {
  const normalized = normalizeSpeechText(rawSpeech);
  if (!normalized) return null;

  // AI Assistant triggers
  if (
    normalized.includes('ai assistant') ||
    normalized.includes('ask ai') ||
    normalized.includes('open copilot') ||
    normalized.includes('open ai') ||
    normalized.includes('ai grocer') ||
    normalized.includes('seller ai') ||
    normalized.includes('talk to ai')
  ) {
    return { intent: VOICE_INTENTS.AI_ASSISTANT, raw: rawSpeech, normalized };
  }

  // Cart / Basket triggers
  if (
    normalized.includes('cart') ||
    normalized.includes('basket') ||
    normalized.includes('checkout') ||
    normalized.includes('my items')
  ) {
    return { intent: VOICE_INTENTS.SHOP_CART, raw: rawSpeech, normalized };
  }

  // Wishlist triggers
  if (
    normalized.includes('wishlist') ||
    normalized.includes('favorite') ||
    normalized.includes('favourites') ||
    normalized.includes('saved items')
  ) {
    return { intent: VOICE_INTENTS.SHOP_WISHLIST, raw: rawSpeech, normalized };
  }

  // Offers & Deals triggers
  if (
    normalized.includes('offer') ||
    normalized.includes('deal') ||
    normalized.includes('discount') ||
    normalized.includes('coupon') ||
    normalized.includes('promo') ||
    normalized.includes('sale today')
  ) {
    return { intent: VOICE_INTENTS.SHOP_OFFERS, raw: rawSpeech, normalized };
  }

  // Orders / Purchase history triggers
  if (
    normalized.includes('my order') ||
    normalized.includes('my orders') ||
    normalized.includes('track order') ||
    normalized.includes('order history') ||
    normalized.includes('past orders')
  ) {
    return { intent: VOICE_INTENTS.SHOP_ORDERS, raw: rawSpeech, normalized };
  }

  // Categories triggers
  if (
    normalized.includes('category') ||
    normalized.includes('categories') ||
    normalized.includes('departments') ||
    normalized.includes('aisles')
  ) {
    return { intent: VOICE_INTENTS.SHOP_CATEGORIES, raw: rawSpeech, normalized };
  }

  // Purchase Orders triggers (Admin supply chain)
  if (
    normalized.includes('purchase order') ||
    normalized.includes('purchase orders') ||
    normalized.includes('po requisitions') ||
    normalized.includes('reorder po') ||
    normalized.includes('supplier orders')
  ) {
    return { intent: VOICE_INTENTS.PURCHASE_ORDERS, raw: rawSpeech, normalized };
  }

  // Suppliers triggers
  if (
    normalized.includes('supplier') ||
    normalized.includes('suppliers') ||
    normalized.includes('vendor') ||
    normalized.includes('lead time')
  ) {
    return { intent: VOICE_INTENTS.SUPPLIERS, raw: rawSpeech, normalized };
  }

  // Stores triggers
  if (
    normalized.includes('store') ||
    normalized.includes('stores') ||
    normalized.includes('branch') ||
    normalized.includes('branches') ||
    normalized.includes('outlets')
  ) {
    // Distinguish "stores" (Admin) from "seller store"
    if (normalized.includes('seller') || normalized.includes('shift')) {
      return { intent: VOICE_INTENTS.SELLER_DASHBOARD, raw: rawSpeech, normalized };
    }
    return { intent: VOICE_INTENTS.STORES, raw: rawSpeech, normalized };
  }

  // Employees / Star Sellers triggers
  if (
    normalized.includes('employee') ||
    normalized.includes('employees') ||
    normalized.includes('staff') ||
    normalized.includes('star seller') ||
    normalized.includes('workforce')
  ) {
    return { intent: VOICE_INTENTS.EMPLOYEES, raw: rawSpeech, normalized };
  }

  // Payments / Transactions triggers
  if (
    normalized.includes('payment') ||
    normalized.includes('payments') ||
    normalized.includes('transaction') ||
    normalized.includes('transactions') ||
    normalized.includes('settlements')
  ) {
    return { intent: VOICE_INTENTS.PAYMENTS, raw: rawSpeech, normalized };
  }

  // Forecasting / Predictive triggers
  if (
    normalized.includes('forecast') ||
    normalized.includes('forecasting') ||
    normalized.includes('predictions') ||
    normalized.includes('demand forecast')
  ) {
    return { intent: VOICE_INTENTS.FORECASTING, raw: rawSpeech, normalized };
  }

  // Analytics / BI triggers
  if (
    normalized.includes('analytic') ||
    normalized.includes('analytics') ||
    normalized.includes('business intelligence') ||
    normalized.includes('metrics') ||
    normalized.includes('charts')
  ) {
    return { intent: VOICE_INTENTS.ANALYTICS, raw: rawSpeech, normalized };
  }

  // Seller Performance triggers
  if (
    normalized.includes('performance') ||
    normalized.includes('my quota') ||
    normalized.includes('shift target') ||
    normalized.includes('shift performance')
  ) {
    return { intent: VOICE_INTENTS.SELLER_PERFORMANCE, raw: rawSpeech, normalized };
  }

  // Best Sellers triggers
  if (
    normalized.includes('best seller') ||
    normalized.includes('best sellers') ||
    normalized.includes('top selling') ||
    normalized.includes('top products')
  ) {
    return { intent: VOICE_INTENTS.SELLER_BEST_SELLERS, raw: rawSpeech, normalized };
  }

  // Customers triggers
  if (
    normalized.includes('customer') ||
    normalized.includes('customers') ||
    normalized.includes('clients') ||
    normalized.includes('vip')
  ) {
    return { intent: VOICE_INTENTS.CUSTOMERS, raw: rawSpeech, normalized };
  }

  // Inventory triggers
  if (
    normalized.includes('inventory') ||
    normalized.includes('stock') ||
    normalized.includes('stockout') ||
    normalized.includes('warehouse') ||
    normalized.includes('shelf')
  ) {
    return { intent: VOICE_INTENTS.INVENTORY, raw: rawSpeech, normalized };
  }

  // Sales triggers
  if (
    normalized.includes('sales') ||
    normalized.includes('revenue') ||
    normalized.includes('pos') ||
    normalized.includes('record sale') ||
    normalized.includes('register sale')
  ) {
    return { intent: VOICE_INTENTS.SALES, raw: rawSpeech, normalized };
  }

  // Products catalog triggers
  if (
    normalized.includes('product') ||
    normalized.includes('products') ||
    normalized.includes('item') ||
    normalized.includes('items') ||
    normalized.includes('catalog') ||
    normalized.includes('groceries')
  ) {
    return { intent: VOICE_INTENTS.PRODUCTS, raw: rawSpeech, normalized };
  }

  // Reports triggers
  if (
    normalized.includes('report') ||
    normalized.includes('reports') ||
    normalized.includes('export') ||
    normalized.includes('audit')
  ) {
    return { intent: VOICE_INTENTS.REPORTS, raw: rawSpeech, normalized };
  }

  // Settings triggers
  if (
    normalized.includes('setting') ||
    normalized.includes('settings') ||
    normalized.includes('preference') ||
    normalized.includes('preferences') ||
    normalized.includes('theme') ||
    normalized.includes('language')
  ) {
    return { intent: VOICE_INTENTS.SETTINGS, raw: rawSpeech, normalized };
  }

  // Profile triggers
  if (
    normalized.includes('profile') ||
    normalized.includes('account') ||
    normalized.includes('my details') ||
    normalized.includes('address')
  ) {
    return { intent: VOICE_INTENTS.SHOP_PROFILE, raw: rawSpeech, normalized };
  }

  // Dashboard / Home triggers
  if (
    normalized.includes('dashboard') ||
    normalized.includes('command center') ||
    normalized.includes('executive')
  ) {
    return { intent: VOICE_INTENTS.DASHBOARD, raw: rawSpeech, normalized };
  }

  if (
    normalized.includes('seller') ||
    normalized.includes('shift terminal') ||
    normalized.includes('terminal')
  ) {
    return { intent: VOICE_INTENTS.SELLER_DASHBOARD, raw: rawSpeech, normalized };
  }

  if (
    normalized.includes('shop') ||
    normalized.includes('supermarket') ||
    normalized.includes('storefront') ||
    normalized.includes('home')
  ) {
    return { intent: VOICE_INTENTS.SHOP_HOME, raw: rawSpeech, normalized };
  }

  return null;
}
