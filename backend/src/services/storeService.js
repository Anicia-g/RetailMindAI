const storeRepository = require('../repositories/storeRepository');

class StoreService {
  async getAllStores() {
    const rows = await storeRepository.findAll();
    return rows.map((r) => storeRepository.toDTO(r));
  }

  async getStoreById(id) {
    const row = await storeRepository.findByIdOrCode(id);
    if (!row) {
      throw new Error(`Store '${id}' not found.`);
    }
    return storeRepository.toDTO(row);
  }

  async createStore(data, user = null) {
    const newStore = await storeRepository.createStore(
      {
        txt_Store_Code: data.code || `STR-${Date.now().toString().slice(-4)}`,
        txt_Store_Name: data.name,
        txt_Store_Type: data.type || 'Supermarket',
        txt_Address_Line1: data.addressLine1 || data.address || 'Flagship Street',
        txt_Address_Line2: data.addressLine2 || null,
        txt_City: data.city || 'Bangalore',
        txt_State: data.state || 'Karnataka',
        txt_Country: data.country || 'India',
        txt_Pincode: data.pincode || '560038',
        txt_Contact_Number: data.phone || data.contactNumber || '+91 80 2520 1100',
        txt_Email: data.email || null,
        txt_Manager_Name: data.manager || null,
        bit_Is_Head_Office: data.isHeadOffice ? 1 : 0,
        bit_Is_Warehouse_Attached: data.isWarehouseAttached ? 1 : 1,
      },
      user?.name || 'system'
    );
    return storeRepository.toDTO(newStore);
  }

  async updateStore(id, data, user = null) {
    const existing = await storeRepository.findByIdOrCode(id);
    if (!existing) {
      throw new Error(`Store '${id}' not found.`);
    }
    const updated = await storeRepository.updateStore(
      existing.int_Store_Id,
      {
        txt_Store_Name: data.name,
        txt_Store_Type: data.type,
        txt_Address_Line1: data.addressLine1 || data.address,
        txt_City: data.city,
        txt_State: data.state,
        txt_Pincode: data.pincode,
        txt_Contact_Number: data.phone,
        txt_Email: data.email,
        txt_Manager_Name: data.manager,
      },
      user?.name || 'system'
    );
    return storeRepository.toDTO(updated);
  }

  async deleteStore(id, user = null) {
    const existing = await storeRepository.findByIdOrCode(id);
    if (!existing) {
      throw new Error(`Store '${id}' not found.`);
    }
    return await storeRepository.softDelete(existing.int_Store_Id, user?.name || 'system');
  }
}

module.exports = new StoreService();
