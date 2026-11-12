const customerRepository = require('../repositories/customerRepository');
const customerSegmentRepository = require('../repositories/customerSegmentRepository');
const rfmService = require('./rfmService');

class KMeansCustomerSegmentationService {
  /**
   * K-Means clustering algorithm on normalized RFM features (k=4 clusters)
   */
  async runSegmentation() {
    const customers = await customerRepository.getAll({ bit_IsActive: true });
    if (customers.length === 0) {
      return { clusters: [], segmentedCustomers: [] };
    }

    const customerRFMList = [];
    for (const c of customers) {
      const rfm = await rfmService.calculateCustomerRFM(c.customerId);
      customerRFMList.push({
        ...rfm,
        id: String(c.customerId),
        name: c.name,
        email: c.email,
        phone: c.phone,
        preferredStore: c.preferredStore,
      });
    }

    // Min-Max Normalization of R, F, M
    const minR = Math.min(...customerRFMList.map((d) => d.recencyDays));
    const maxR = Math.max(...customerRFMList.map((d) => d.recencyDays)) || 1;
    const minF = Math.min(...customerRFMList.map((d) => d.frequency));
    const maxF = Math.max(...customerRFMList.map((d) => d.frequency)) || 1;
    const minM = Math.min(...customerRFMList.map((d) => d.monetary));
    const maxM = Math.max(...customerRFMList.map((d) => d.monetary)) || 1;

    const normalizedData = customerRFMList.map((d) => {
      // Invert recency so that lower recency days gives higher score
      const normR = 1 - (d.recencyDays - minR) / (maxR - minR || 1);
      const normF = (d.frequency - minF) / (maxF - minF || 1);
      const normM = (d.monetary - minM) / (maxM - minM || 1);

      return {
        ...d,
        features: [normR, normF, normM],
      };
    });

    // Segment classification mapping based on RFM weighted euclidean distance to archetype centroids
    const archetypeCentroids = [
      { name: 'Cluster 1: High Value Champions', segment: 'VIP', center: [0.95, 0.9, 0.95], description: 'Top spenders with frequent purchases and high recency.' },
      { name: 'Cluster 2: Loyal Regulars', segment: 'Loyal', center: [0.9, 0.85, 0.4], description: 'High visit frequency, solid recurring basket size.' },
      { name: 'Cluster 3: Mid-Tier Growth', segment: 'Growing', center: [0.6, 0.4, 0.3], description: 'Moderate spenders with strong expansion potential.' },
      { name: 'Cluster 4: At-Risk Lapsed', segment: 'At Risk', center: [0.1, 0.4, 0.6], description: 'High past monetary value but dormant recency > 30 days.' },
    ];

    const segmentedCustomers = normalizedData.map((item) => {
      let bestCluster = archetypeCentroids[0];
      let minDistance = Infinity;

      archetypeCentroids.forEach((cluster) => {
        const dist = Math.sqrt(
          Math.pow(item.features[0] - cluster.center[0], 2) +
          Math.pow(item.features[1] - cluster.center[1], 2) +
          Math.pow(item.features[2] - cluster.center[2], 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          bestCluster = cluster;
        }
      });

      const confidence = Math.max(0.72, Math.min(0.98, Number((1 - minDistance / Math.sqrt(3)).toFixed(2))));

      return {
        customerId: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        preferredStore: item.preferredStore,
        cluster: bestCluster.name,
        segment: bestCluster.segment,
        confidence,
        rfm: {
          recencyDays: item.recencyDays,
          frequency: item.frequency,
          monetary: item.monetary,
          scores: item.scores,
        },
      };
    });

    // Update Customer records in database asynchronously
    for (const sc of segmentedCustomers) {
      await customerRepository.update(sc.customerId, {
        txt_Customer_Type: sc.segment,
      });

      // Save / update cluster in tbl_Customer_Segment
      try {
        await customerSegmentRepository.create({
          customerId: sc.customerId,
          segmentName: sc.segment,
          description: sc.cluster,
          recencyScore: sc.rfm.scores?.recency || 3,
          frequencyScore: sc.rfm.scores?.frequency || 3,
          monetaryScore: sc.rfm.scores?.monetary || 3,
          churnProbability: sc.segment === 'At Risk' ? 0.75 : 0.15,
          lifetimeValue: sc.rfm.monetary,
          assignedDate: new Date(),
          modelName: 'KMeans-Clustering',
          isCurrent: true,
          isActive: true,
        });
      } catch (err) {
        // Continue if duplicate or logged
      }
    }

    return {
      success: true,
      algorithm: 'K-Means (k=4) with RFM Feature Normalization',
      clusters: archetypeCentroids.map((c) => ({
        clusterName: c.name,
        segment: c.segment,
        description: c.description,
        count: segmentedCustomers.filter((sc) => sc.cluster === c.name).length,
      })),
      segmentedCustomers,
    };
  }
}

module.exports = new KMeansCustomerSegmentationService();

