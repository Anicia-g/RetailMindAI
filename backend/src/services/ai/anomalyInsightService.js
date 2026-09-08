const AnomalyLog = require('../../models/AnomalyLog');

class AnomalyInsightService {
  /**
   * Translates Isolation Forest anomaly predictions into cautious, actionable diagnostic audits
   */
  async getAnomalyInsights(limit = 20) {
    const logs = await AnomalyLog.find({ bit_IsActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formattedInsights = logs.map((log) => {
      const score = log.anomalyScore || 0;
      const isAnomaly = log.isAnomaly;

      let severity = 'LOW';
      let reviewRecommendation = 'Standard periodic transaction check.';

      if (isAnomaly) {
        if (score < -0.15 || log.totalAmount > 15000 || log.discountPct >= 35) {
          severity = 'HIGH';
          reviewRecommendation = 'Immediate store manager review recommended prior to end-of-shift reconciliation.';
        } else {
          severity = 'MEDIUM';
          reviewRecommendation = 'Flag for routine shift supervisor audit and receipt verification.';
        }
      }

      let explanation = '';
      if (log.importantFeatures && log.importantFeatures.length > 0) {
        explanation = `Unusual transaction pattern detected driven by: ${log.importantFeatures.join(', ')}.`;
      } else if (log.totalAmount > 8000) {
        explanation = `Transaction total (₹${log.totalAmount}) significantly exceeds the store's typical average order value.`;
      } else if (log.discountPct > 20) {
        explanation = `Applied discount (${log.discountPct}%) is elevated relative to standard supermarket policy.`;
      } else {
        explanation = 'Multi-variate transaction deviation detected by Isolation Forest algorithm.';
      }

      return {
        id: log._id ? log._id.toString() : log.id,
        transactionId: log.transactionId,
        orderId: log.orderId,
        totalAmount: log.totalAmount,
        itemCount: log.itemCount,
        hourOfDay: log.hourOfDay,
        discountPct: log.discountPct,
        isAnomaly: log.isAnomaly,
        anomalyScore: Math.round(score * 1000) / 1000,
        severity,
        status: log.status || (isAnomaly ? 'Unusual - Requires Manager Review' : 'Normal Transaction'),
        explanation,
        reviewRecommendation,
        algorithm: log.algorithm || 'Isolation Forest (Unsupervised)',
        generatedDate: log.generatedDate || log.createdAt || new Date(),
      };
    });

    const unusualCount = formattedInsights.filter((i) => i.isAnomaly).length;

    return {
      totalAudited: formattedInsights.length,
      unusualTransactionsCount: unusualCount,
      highSeverityCount: formattedInsights.filter((i) => i.severity === 'HIGH').length,
      items: formattedInsights,
    };
  }
}

module.exports = new AnomalyInsightService();
