const customerRepository = require('../repositories/customerRepository');
const db = require('../config/db');

class RfmService {
  /**
   * Calculates RFM metrics (Recency in days, Frequency of purchases, Monetary total spend)
   * from live MySQL transaction history.
   */
  async calculateCustomerRFM(customerId) {
    const customer = await customerRepository.getById(customerId) || 
      (await customerRepository.getAll({ txt_Customer_Name: customerId }))[0];

    if (!customer) {
      throw new Error(`Customer '${customerId}' not found.`);
    }

    const ordersSql = `
      SELECT * FROM tbl_Order
      WHERE int_Customer_Id = ? AND bit_IsActive = 1 AND txt_Order_Status != 'Cancelled'
      ORDER BY dtm_Created_At DESC
    `;
    const orders = await db.query(ordersSql, [customer.customerId]);

    const frequency = orders.length || customer.totalOrders || 1;
    const monetary = orders.reduce((sum, o) => sum + (Number(o.dec_Total_Amount) || 0), 0) || customer.totalSpent || 5000;

    let recencyDays = 30;
    if (orders.length > 0) {
      const latestOrderDate = orders[0].dtm_Created_At ? new Date(orders[0].dtm_Created_At) : new Date();
      const diffTime = Math.abs(new Date() - latestOrderDate);
      recencyDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Assign RFM scores from 1 to 5
    const rScore = recencyDays <= 3 ? 5 : recencyDays <= 7 ? 4 : recencyDays <= 14 ? 3 : recencyDays <= 30 ? 2 : 1;
    const fScore = frequency >= 30 ? 5 : frequency >= 20 ? 4 : frequency >= 10 ? 3 : frequency >= 5 ? 2 : 1;
    const mScore = monetary >= 100000 ? 5 : monetary >= 50000 ? 4 : monetary >= 20000 ? 3 : monetary >= 5000 ? 2 : 1;

    return {
      customerId: String(customer.customerId),
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
    const customers = await customerRepository.getAll({ bit_IsActive: true });
    const rfmResults = [];

    for (const c of customers) {
      const rfm = await this.calculateCustomerRFM(c.customerId);
      rfmResults.push(rfm);
    }

    return rfmResults;
  }
}

module.exports = new RfmService();

