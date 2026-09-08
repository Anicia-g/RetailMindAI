const User = require('../models/User');
const sellerAnalyticsService = require('./sellerAnalyticsService');
const Product = require('../models/Product');

class SellerService {
  async getAllSellers() {
    return await User.find({ role: 'SELLER', bit_IsActive: true }).select('-passwordHash');
  }

  async getSellerById(id) {
    return await User.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { email: id }],
      role: 'SELLER',
      bit_IsActive: true,
    }).select('-passwordHash');
  }

  async createSeller(data, creator = null) {
    const salt = await require('bcryptjs').genSalt(10);
    const passwordHash = await require('bcryptjs').hash(data.password || 'seller1234', salt);

    return await User.create({
      ...data,
      passwordHash,
      role: 'SELLER',
      permissions: ['sales', 'inventory:read', 'orders', 'products:read'],
      txt_Created_By: creator?.name || 'system',
    });
  }

  async updateSeller(id, data, modifier = null) {
    const seller = await User.findOneAndUpdate(
      {
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { email: id }],
        role: 'SELLER',
      },
      {
        ...data,
        txt_Modified_By: modifier?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true }
    ).select('-passwordHash');

    if (!seller) throw new Error(`Seller '${id}' not found.`);
    return seller;
  }

  async getSellerDashboard(sellerUser) {
    return await sellerAnalyticsService.getSellerDashboard(sellerUser);
  }

  async getSellerBestSellers(sellerUser) {
    const storeId = sellerUser?.storeId || 'store-01';
    return await Product.find({
      bit_IsActive: true,
      $or: [{ storeId }, { 'storeAssignments.storeId': storeId }],
    }).sort({ unitsSold: -1 }).limit(10);
  }

  async getSellerBestCustomer(sellerUser) {
    return await sellerAnalyticsService.getSellerBestCustomer(sellerUser);
  }

  async getSellerPerformance(query = {}) {
    return await sellerAnalyticsService.getSellerPerformance(query);
  }
}

module.exports = new SellerService();
