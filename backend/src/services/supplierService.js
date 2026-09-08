const Supplier = require('../models/Supplier');

class SupplierService {
  async getAllSuppliers() {
    return await Supplier.find({ bit_IsActive: true }).sort({ rating: -1 });
  }

  async getSupplierById(id) {
    return await Supplier.findOne({
      $or: [{ supplierId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      bit_IsActive: true,
    });
  }

  async createSupplier(data, user = null) {
    const supplierId = data.supplierId || `sup-${Date.now()}`;
    return await Supplier.create({
      ...data,
      supplierId,
      txt_Created_By: user?.name || 'system',
    });
  }

  async updateSupplier(id, data, user = null) {
    const supplier = await Supplier.findOneAndUpdate(
      {
        $or: [{ supplierId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        ...data,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!supplier) throw new Error(`Supplier '${id}' not found.`);
    return supplier;
  }

  async deleteSupplier(id, user = null) {
    const supplier = await Supplier.findOneAndUpdate(
      {
        $or: [{ supplierId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        bit_IsActive: false,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true }
    );

    if (!supplier) throw new Error(`Supplier '${id}' not found.`);
    return { message: 'Supplier deactivated successfully.' };
  }
}

module.exports = new SupplierService();
