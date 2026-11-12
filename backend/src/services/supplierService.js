const supplierRepository = require('../repositories/supplierRepository');

class SupplierService {
  async getAllSuppliers() {
    const rows = await supplierRepository.findAll();
    return rows.map((r) => supplierRepository.toDTO(r));
  }

  async getSupplierById(id) {
    const row = await supplierRepository.findByIdOrCode(id);
    if (!row) {
      throw new Error(`Supplier '${id}' not found.`);
    }
    return supplierRepository.toDTO(row);
  }

  async createSupplier(data, user = null) {
    const newSupplier = await supplierRepository.createSupplier(
      {
        txt_Supplier_Code: data.code || `SUP-${Date.now().toString().slice(-4)}`,
        txt_Supplier_Name: data.name,
        txt_Contact_Person_Name: data.contactPerson || data.contactPersonName || null,
        txt_Contact_Number: data.phone || data.contactNumber || '+91 98450 11223',
        txt_Email: data.email || null,
        txt_Address_Line1: data.address || null,
        txt_City: data.city || 'Bangalore',
        txt_State: data.state || 'Karnataka',
        txt_GSTIN: data.gst || null,
        txt_PAN: data.pan || null,
        dec_Rating: data.rating || 4.5,
        dec_Average_Lead_Time_Days: data.leadTimeDays || 2,
        txt_Payment_Terms: data.paymentTerms || 'Net 30',
        bit_Is_Preferred_Supplier: data.isPreferred ? 1 : 1,
      },
      user?.name || 'system'
    );
    return supplierRepository.toDTO(newSupplier);
  }

  async updateSupplier(id, data, user = null) {
    const existing = await supplierRepository.findByIdOrCode(id);
    if (!existing) {
      throw new Error(`Supplier '${id}' not found.`);
    }
    const updated = await supplierRepository.updateSupplier(
      existing.int_Supplier_Id,
      {
        txt_Supplier_Name: data.name,
        txt_Contact_Person_Name: data.contactPerson,
        txt_Contact_Number: data.phone,
        txt_Email: data.email,
        txt_Address_Line1: data.address,
        txt_City: data.city,
        txt_Supplier_Category: data.category,
        dec_Rating: data.rating,
      },
      user?.name || 'system'
    );
    return supplierRepository.toDTO(updated);
  }

  async deleteSupplier(id, user = null) {
    const existing = await supplierRepository.findByIdOrCode(id);
    if (!existing) {
      throw new Error(`Supplier '${id}' not found.`);
    }
    return await supplierRepository.softDelete(existing.int_Supplier_Id, user?.name || 'system');
  }
}

module.exports = new SupplierService();
