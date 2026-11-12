const BaseRepository = require('./baseRepository');

class BrandRepository extends BaseRepository {
  constructor() {
    super('tbl_Brand', 'int_Brand_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Brand_Id),
      id: String(row.int_Brand_Id),
      brandId: row.int_Brand_Id,
      code: row.txt_Brand_Code,
      name: row.txt_Brand_Name,
      manufacturer: row.txt_Manufacturer_Name,
      countryOfOrigin: row.txt_Country_Of_Origin,
      website: row.txt_Website,
      description: row.txt_Brand_Description,
      logoUrl: row.txt_Logo_URL,
      isPreferred: this.toBoolean(row.bit_Is_Preferred_Brand),
      isExclusive: this.toBoolean(row.bit_Is_Exclusive_Brand),
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByNameOrCode(identifier, connection = null) {
    const sql = `
      SELECT * FROM tbl_Brand 
      WHERE (txt_Brand_Code = ? OR LOWER(txt_Brand_Name) = LOWER(?)) 
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [identifier, identifier], connection);
    return rows[0] || null;
  }

  async createBrand(data, user = 'system', connection = null) {
    const brandId = data.int_Brand_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const sql = `
      INSERT INTO tbl_Brand (
        int_Brand_Id,
        txt_Brand_Code,
        txt_Brand_Name,
        txt_Manufacturer_Name,
        txt_Country_Of_Origin,
        txt_Website,
        txt_Brand_Description,
        txt_Logo_URL,
        bit_Is_Preferred_Brand,
        bit_Is_Exclusive_Brand,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      brandId,
      auditData.txt_Brand_Code,
      auditData.txt_Brand_Name,
      auditData.txt_Manufacturer_Name || null,
      auditData.txt_Country_Of_Origin || 'India',
      auditData.txt_Website || auditData.website || null,
      auditData.txt_Brand_Description || auditData.description || null,
      auditData.txt_Logo_URL || auditData.logoUrl || null,
      auditData.bit_Is_Preferred_Brand ? 1 : 0,
      auditData.bit_Is_Exclusive_Brand ? 1 : 0,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Brand_Id: brandId };
  }
}

module.exports = new BrandRepository();
