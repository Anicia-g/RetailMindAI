const Customer = require('../models/Customer');
const Order = require('../models/Order');

class RfmService {
  /**
   * Calculates RFM metrics (Recency in days, Frequency of purchases, Monetary total spend)
   * from live MongoDB transaction history.
   */
  async calculateCustomerRFM(customerId) {
    const customer = await Customer.findOne({
      $or: [{ customerId }, { _id: customerId.match(/^[0-9a-fA-F]{24}$/) ? customerId : null }],
    });

    if (!customer) {
      throw new Error(`Customer '${customerId}' not found.`);
    }

    const orders = await Order.find({
      $or: [{ customerId: customer.customerId }, { customerName: customer.name }],
      status: { $ne: 'Cancelled' },
    }).sort({ createdAt: -1 });

    const frequency = orders.length || customer.orders || 1;
    const monetary = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || customer.totalSpent || 5000;

    let recencyDays = customer.recencyDays;
    if (orders.length > 0) {
      const latestOrderDate = orders[0].createdAt || new Date(orders[0].date);
      const diffTime = Math.abs(new Date() - new Date(latestOrderDate));
      recencyDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Assign RFM scores from 1 to 5
    const rScore = recencyDays <= 3 ? 5 : recencyDays <= 7 ? 4 : recencyDays <= 14 ? 3 : recencyDays <= 30 ? 2 : 1;
    const fScore = frequency >= 30 ? 5 : frequency >= 20 ? 4 : frequency >= 10 ? 3 : frequency >= 5 ? 2 : 1;
    const mScore = monetary >= 100000 ? 5 : monetary >= 50000 ? 4 : monetary >= 20000 ? 3 : monetary >= 5000 ? 2 : 1;

    return {
      customerId: customer.customerId,
      name: customer.name,
      recencyDays,
      frequency,
      monetary,
      scores: {
        recency: rScore,
        frequency: fScore,
        monetary: mScore,
        rfmCombined: `${rScore}${fScore}${mScore}`,
      },
    };
  }

  async calculateAllCustomersRFM() {
    const customers = await Customer.find({ bit_IsActive: true });
    const rfmResults = [];

    for (const c of customers) {
      const rfm = await this.calculateCustomerRFM(c.customerId);
      rfmResults.push(rfm);
    }

    return rfmResults;
  }
}

module.exports = new RfmService();
