/**
 * Date and period utilities for analytics aggregation
 */

function parseDateRange(range = '30d', startDateStr = null, endDateStr = null) {
  const now = new Date();
  let endDate = new Date(now);
  let startDate = new Date(now);

  if (startDateStr && endDateStr) {
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);
    // Set end of day for end date
    endDate.setHours(23, 59, 59, 999);
    startDate.setHours(0, 0, 0, 0);
  } else {
    const r = String(range).toLowerCase();
    endDate.setHours(23, 59, 59, 999);

    if (r === 'today' || r === '1d') {
      startDate.setHours(0, 0, 0, 0);
    } else if (r === '7d' || r === '7 days' || r === 'week') {
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (r === '30d' || r === '30 days' || r === 'month') {
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (r === '90d' || r === '90 days' || r === 'quarter' || r === '3m') {
      startDate.setDate(startDate.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
    } else if (r === 'ytd') {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    } else if (r === '12m' || r === '1y' || r === '365d') {
      startDate.setDate(startDate.getDate() - 365);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Default 30d
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }
  }

  // Calculate duration in days
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate equivalent previous period
  const prevEndDate = new Date(startDate);
  prevEndDate.setMilliseconds(prevEndDate.getMilliseconds() - 1);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - diffDays);
  prevStartDate.setHours(0, 0, 0, 0);

  return {
    startDate,
    endDate,
    diffDays,
    prevStartDate,
    prevEndDate,
    startDateStr: startDate.toISOString().split('T')[0],
    endDateStr: endDate.toISOString().split('T')[0],
  };
}

/**
 * Calculate mathematical percentage change safely
 * ((current - previous) / previous) * 100
 */
function calculateGrowthPercentage(current, previous) {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;

  if (prev === 0) {
    if (curr > 0) return 100;
    if (curr === 0) return 0;
    return -100;
  }

  const change = curr - prev;
  const pct = (change / Math.abs(prev)) * 100;
  return Number(pct.toFixed(2));
}

/**
 * Format growth percentage as string (+14.2% or -5.3%)
 */
function formatGrowthString(percentage) {
  const num = Number(percentage) || 0;
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
}

module.exports = {
  parseDateRange,
  calculateGrowthPercentage,
  formatGrowthString,
};
