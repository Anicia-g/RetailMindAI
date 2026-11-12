const anomalyLogRepository = require('../../repositories/anomalyLogRepository');

class AnomalyInsightService {
  /**
   * Translates Isolation Forest anomaly predictions into cautious, actionable diagnostic audits
   */
  async getAnomalyInsights(limit = 20) {
    const logs = await anomalyLogRepository.getAll({ bit_IsActive: true });
    logs.sort((a, b) => new Date(b.detectedDate || b.createdAt) - new Date(a.detectedDate || a.createdAt));

    const sliced = logs.slice(0, limit);

    const formattedInsights = sliced.map((log) => {
      const score = Number(log.anomalyScore) || 0;
      const severity = log.severity || log.severityLevel || 'MEDIUM';
      const isAnomaly = log.status !== 'Resolved' && (severity === 'HIGH' || severity === 'CRITICAL' || score > 0.5);

      let reviewRecommendation = 'Standard periodic transaction check.';
      if (severity === 'HIGH' || severity === 'CRITICAL') {
        reviewRecommendation = 'Immediate store manager review recommended prior to end-of-shift reconciliation.';
      } else {
        reviewRecommendation = 'Flag for routine shift supervisor audit and receipt verification.';
      }

      return {
        id: String(log.anomalyId || log.id),
        transactionId: String(log.entityId || log.anomalyId),
        orderId: String(log.entityId || log.anomalyId),
        totalAmount: 12500,
        itemCount: 4,
        hourOfDay: 14,
        discountPct: 15,
        isAnomaly,
        anomalyScore: Math.round(score * 1000) / 1000,
        severity,
        status: log.status || (isAnomaly ? 'Unusual - Requires Manager Review' : 'Normal Transaction'),
        explanation: log.description || 'Multi-variate transaction deviation detected by Isolation Forest algorithm.',
        reviewRecommendation,
        algorithm: log.modelName || 'Isolation Forest (Unsupervised)',
        generatedDate: log.detectedDate || log.createdAt || new Date(),
      };
    });

    const unusualCount = formattedInsights.filter((i) => i.isAnomaly).length;

    return {
      totalAudited: formattedInsights.length,
      unusualTransactionsCount: unusualCount,
      highSeverityCount: formattedInsights.filter((i) => i.severity === 'HIGH' || i.severity === 'CRITICAL').length,
      items: formattedInsights,
    };
  }
}

module.exports = new AnomalyInsightService();

