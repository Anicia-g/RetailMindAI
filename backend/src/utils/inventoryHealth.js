/**
 * Centralized Inventory Health and Velocity Evaluation Rules
 */

const INVENTORY_STATUS = {
  HEALTHY: 'Healthy',
  LOW: 'Low Stock',
  CRITICAL: 'Critical',
  OUT_OF_STOCK: 'Out of Stock',
  OVERSTOCK: 'Overstock',
};

/**
 * Calculate days of stock remaining safely
 * currentStock / averageDailyDemand
 */
function calculateDaysRemaining(currentStock, dailyDemand) {
  const stock = Math.max(0, Number(currentStock) || 0);
  const demand = Math.max(0, Number(dailyDemand) || 0);

  if (stock === 0) return 0;
  if (demand === 0) return 999; // Safely represents indefinite stock without causing NaN or Infinity

  const days = stock / demand;
  return Number(days.toFixed(1));
}

/**
 * Determine inventory health status based on standardized business rules
 * @param {Object} item - { currentStock, reorderLevel, maxStock, dailyVelocity, expiryDays }
 */
function evaluateInventoryHealth(item = {}) {
  const stock = Number(item.currentStock ?? item.stock) || 0;
  const reorder = Number(item.reorderLevel ?? item.minStock) || 20;
  const max = Number(item.maxStock) || (reorder * 4);
  const velocity = Number(item.dailyVelocity) || 0;
  const expiry = item.expiryDays !== undefined && item.expiryDays !== null ? Number(item.expiryDays) : null;
  const daysRemaining = calculateDaysRemaining(stock, velocity);

  if (stock <= 0) {
    return {
      status: INVENTORY_STATUS.OUT_OF_STOCK,
      riskLevel: 'Critical',
      stockoutProbability: 100,
      daysRemaining: 0,
      actionRequired: 'Emergency replenishment immediately',
    };
  }

  if (stock <= reorder * 0.5 || daysRemaining <= 2) {
    return {
      status: INVENTORY_STATUS.CRITICAL,
      riskLevel: 'Critical',
      stockoutProbability: 90,
      daysRemaining,
      actionRequired: 'Place immediate purchase order',
    };
  }

  if (stock <= reorder || daysRemaining <= 5) {
    return {
      status: INVENTORY_STATUS.LOW,
      riskLevel: 'High',
      stockoutProbability: 70,
      daysRemaining,
      actionRequired: 'Reorder batch within 48 hours',
    };
  }

  if (stock > max || daysRemaining > 60) {
    return {
      status: INVENTORY_STATUS.OVERSTOCK,
      riskLevel: 'Low',
      stockoutProbability: 5,
      daysRemaining,
      actionRequired: 'Apply promotional smart discount',
    };
  }

  // If expiring soon (< 7 days) and has stock
  if (expiry !== null && expiry <= 6 && stock > 0) {
    return {
      status: 'Expiring',
      riskLevel: 'High',
      stockoutProbability: 10,
      daysRemaining,
      actionRequired: 'Flash clearance discount recommended',
    };
  }

  return {
    status: INVENTORY_STATUS.HEALTHY,
    riskLevel: 'Low',
    stockoutProbability: 15,
    daysRemaining,
    actionRequired: 'Normal monitoring',
  };
}

/**
 * Calculate sales velocities over days
 */
function calculateVelocities(unitsSold, days = 30) {
  const units = Number(unitsSold) || 0;
  const d = Math.max(1, Number(days) || 30);

  const dailyVelocity = Number((units / d).toFixed(2));
  const weeklyVelocity = Number((dailyVelocity * 7).toFixed(1));
  const monthlyVelocity = Number((dailyVelocity * 30).toFixed(1));

  return {
    dailyVelocity,
    weeklyVelocity,
    monthlyVelocity,
  };
}

module.exports = {
  INVENTORY_STATUS,
  calculateDaysRemaining,
  evaluateInventoryHealth,
  calculateVelocities,
};
