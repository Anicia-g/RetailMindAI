const Store = require('../models/Store');
const Order = require('../models/Order');

class StoreService {
  async getAllStores() {
    return await Store.find({ bit_IsActive: true }).sort({ code: 1 });
  }

  async getStoreById(id) {
    return await Store.findOne({
      $or: [{ storeId: id }, { code: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      bit_IsActive: true,
    });
  }

  async createStore(data, user = null) {
    const storeId = data.storeId || `store-${Date.now()}`;
    return await Store.create({
      ...data,
      storeId,
      txt_Created_By: user?.name || 'system',
    });
  }

  async updateStore(id, data, user = null) {
    const store = await Store.findOneAndUpdate(
      {
        $or: [{ storeId: id }, { code: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        ...data,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!store) {
      throw new Error(`Store '${id}' not found.`);
    }

    return store;
  }

  async deleteStore(id, user = null) {
    const store = await Store.findOneAndUpdate(
      {
        $or: [{ storeId: id }, { code: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        bit_IsActive: false,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true }
    );

    if (!store) {
      throw new Error(`Store '${id}' not found.`);
    }

    return { message: 'Store removed successfully.' };
  }
}

module.exports = new StoreService();
