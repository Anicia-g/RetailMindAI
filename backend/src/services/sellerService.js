const userRepository = require('../repositories/userRepository');
const roleRepository = require('../repositories/roleRepository');
const productRepository = require('../repositories/productRepository');
const sellerAnalyticsService = require('./sellerAnalyticsService');
const bcrypt = require('bcryptjs');

class SellerService {
  async getAllSellers() {
    return await userRepository.findAllSellers();
  }

  async getSellerById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error(`Seller '${id}' not found.`);
    }
    return userRepository.toDTO(user);
  }

  async getSellerDashboard(user) {
    return await sellerAnalyticsService.getSellerDashboard(user);
  }

  async getSellerBestSellers(user) {
    const products = await productRepository.findAllProducts({ storeId: user?.storeId });
    return products.slice(0, 10);
  }

  async getSellerBestCustomer(user) {
    return await sellerAnalyticsService.getSellerBestCustomer(user);
  }

  async getSellerPerformance(query) {
    return await sellerAnalyticsService.getSellerPerformance(query);
  }

  async createSeller(data, user = null) {
    const roleRecord = await roleRepository.findByCode('SELLER');
    const roleId = roleRecord?.int_Role_Id || 2;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password || 'seller1234', salt);

    const nameParts = (data.name || '').trim().split(/\s+/);
    const firstName = data.firstName || nameParts[0] || 'Seller';
    const lastName = data.lastName || nameParts.slice(1).join(' ') || 'Staff';
    const email = (data.email || `seller_${Date.now()}@retailmind.ai`).toLowerCase();
    const username = email.split('@')[0];

    const storeIdMatch = String(data.storeId || 'store-01').match(/\d+/);
    const storeId = storeIdMatch ? parseInt(storeIdMatch[0], 10) : 1;

    const newUser = await userRepository.createUser(
      {
        txt_Employee_Code: data.employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
        txt_First_Name: firstName,
        txt_Last_Name: lastName,
        txt_Email: email,
        txt_Phone_Number: data.phone || '+91 98450 11234',
        txt_Password_Hash: passwordHash,
        txt_Username: username,
        int_Role_Id: roleId,
        int_Store_Id: storeId,
        txt_Profile_Image_Url: data.image || null,
      },
      user?.name || 'system'
    );

    return userRepository.toDTO({
      ...newUser,
      role_code: 'SELLER',
      role_name: 'SELLER',
    });
  }

  async updateSeller(id, data, user = null) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new Error(`Seller '${id}' not found.`);
    }

    const nameParts = (data.name || '').trim().split(/\s+/);
    const firstName = data.firstName || (nameParts[0] ? nameParts[0] : existing.txt_First_Name);
    const lastName = data.lastName !== undefined ? data.lastName : (nameParts.length > 1 ? nameParts.slice(1).join(' ') : existing.txt_Last_Name);

    const sql = `
      UPDATE tbl_User
      SET txt_First_Name = ?,
          txt_Last_Name = ?,
          txt_Phone_Number = COALESCE(?, txt_Phone_Number),
          txt_Profile_Image_Url = COALESCE(?, txt_Profile_Image_Url),
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_User_Id = ?
    `;

    const now = userRepository.formatDateTime(new Date());
    await userRepository.execute(sql, [
      firstName,
      lastName,
      data.phone,
      data.image,
      now,
      user?.name || 'system',
      existing.int_User_Id,
    ]);

    const updated = await userRepository.findById(existing.int_User_Id);
    return userRepository.toDTO(updated);
  }
}

module.exports = new SellerService();
