const customerRepository = require('../repositories/customerRepository');
const customerAnalyticsService = require('./customerAnalyticsService');

class CustomerService {
  async getAllCustomers() {
    const rows = await customerRepository.findAll();
    return rows.map((r) => customerRepository.toDTO(r));
  }

  async getBestCustomerAnalytics(storeId = null) {
    const top = await customerAnalyticsService.getTopCustomers(storeId, 1, 'monetary');
    return top[0] || null;
  }

  async getCustomerById(id) {
    const row = await customerRepository.findByIdOrCode(id);
    if (!row) {
      throw new Error(`Customer '${id}' not found.`);
    }
    return customerRepository.toDTO(row);
  }

  async getProfile(userIdOrEmail) {
    const row = await customerRepository.findByEmailOrPhone(userIdOrEmail);
    if (!row) {
      // Fallback: create default customer profile on first load
      const created = await customerRepository.createCustomer({
        txt_First_Name: 'Valued',
        txt_Last_Name: 'Customer',
        txt_Email: userIdOrEmail,
        txt_Phone_Number: '+91 98450 11234',
      });
      return customerRepository.toDTO(created);
    }
    return customerRepository.toDTO(row);
  }

  async updateProfile(userIdOrEmail, data, user = null) {
    const customer = await customerRepository.findByEmailOrPhone(userIdOrEmail);
    if (!customer) {
      throw new Error('Customer profile not found.');
    }

    const nameParts = (data.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || customer.txt_First_Name;
    const lastName = nameParts.slice(1).join(' ') || customer.txt_Last_Name;

    const sql = `
      UPDATE tbl_Customer
      SET txt_First_Name = ?,
          txt_Last_Name = ?,
          txt_Phone_Number = COALESCE(?, txt_Phone_Number),
          txt_Address_Line1 = COALESCE(?, txt_Address_Line1),
          txt_City = COALESCE(?, txt_City),
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Customer_Id = ?
    `;

    const now = customerRepository.formatDateTime(new Date());
    await customerRepository.execute(sql, [
      firstName,
      lastName,
      data.phone,
      data.address,
      data.city,
      now,
      user?.name || 'customer',
      customer.int_Customer_Id,
    ]);

    const updated = await customerRepository.findById(customer.int_Customer_Id);
    return customerRepository.toDTO(updated);
  }

  async getPreferences(userIdOrEmail) {
    const customer = (await customerRepository.findByIdOrCode(userIdOrEmail)) ||
                     (await customerRepository.findByEmailOrPhone(userIdOrEmail));
    const dto = customerRepository.toDTO(customer);
    return dto?.preferences || { whatsappOffers: true, emailUpdates: true, smsNotifications: false };
  }

  async updatePreferences(userIdOrEmail, preferences, user = null) {
    let customer = (await customerRepository.findByIdOrCode(userIdOrEmail)) ||
                   (await customerRepository.findByEmailOrPhone(userIdOrEmail));
    if (!customer) {
      customer = await customerRepository.findById(1);
    }
    if (!customer) {
      throw new Error('Customer profile not found.');
    }
    await customerRepository.updatePreferences(customer.int_Customer_Id, preferences, user?.name || 'customer');
    const updated = await customerRepository.findById(customer.int_Customer_Id);
    const dto = customerRepository.toDTO(updated);
    return dto?.preferences || { whatsappOffers: true, emailUpdates: true, smsNotifications: false };
  }

  async createCustomer(data, user = null) {
    const nameParts = (data.name || '').trim().split(/\s+/);
    const newCust = await customerRepository.createCustomer(
      {
        txt_Customer_Code: data.code || `CUST-${Date.now().toString().slice(-4)}`,
        txt_First_Name: data.firstName || nameParts[0] || 'Customer',
        txt_Last_Name: data.lastName || nameParts.slice(1).join(' ') || null,
        txt_Email: data.email || null,
        txt_Phone_Number: data.phone || '+91 98450 11234',
        txt_Address_Line1: data.address || null,
        txt_City: data.city || 'Bangalore',
        int_Preferred_Store_Id: data.preferredStoreId || 1,
        dec_Total_Purchase_Amount: data.totalSpent || 0,
        int_Loyalty_Points: data.smartCoins || data.loyaltyPoints || 0,
        bit_Is_VIP: data.isVip ? 1 : 0,
      },
      user?.name || 'system'
    );
    return customerRepository.toDTO(newCust);
  }

  async updateCustomer(id, data, user = null) {
    const customer = await customerRepository.findByIdOrCode(id);
    if (!customer) {
      throw new Error(`Customer '${id}' not found.`);
    }

    const nameParts = (data.name || '').trim().split(/\s+/);
    const firstName = data.firstName || nameParts[0] || customer.txt_First_Name;
    const lastName = data.lastName || nameParts.slice(1).join(' ') || customer.txt_Last_Name;

    const sql = `
      UPDATE tbl_Customer
      SET txt_First_Name = ?,
          txt_Last_Name = ?,
          txt_Email = COALESCE(?, txt_Email),
          txt_Phone_Number = COALESCE(?, txt_Phone_Number),
          txt_Address_Line1 = COALESCE(?, txt_Address_Line1),
          txt_City = COALESCE(?, txt_City),
          bit_Is_VIP = COALESCE(?, bit_Is_VIP),
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Customer_Id = ?
    `;

    const now = customerRepository.formatDateTime(new Date());
    await customerRepository.execute(sql, [
      firstName,
      lastName,
      data.email,
      data.phone,
      data.address,
      data.city,
      data.isVip !== undefined ? (data.isVip ? 1 : 0) : null,
      now,
      user?.name || 'system',
      customer.int_Customer_Id,
    ]);

    const updated = await customerRepository.findById(customer.int_Customer_Id);
    return customerRepository.toDTO(updated);
  }

  async deleteCustomer(id, user = null) {
    const customer = await customerRepository.findByIdOrCode(id);
    if (!customer) {
      throw new Error(`Customer '${id}' not found.`);
    }
    return await customerRepository.softDelete(customer.int_Customer_Id, user?.name || 'system');
  }

  async getCustomerClusters() {
    // Return customer cluster rankings from tbl_Customer
    const rows = await customerRepository.findAll();
    return rows.map((r) => customerRepository.toDTO(r));
  }
}

module.exports = new CustomerService();
