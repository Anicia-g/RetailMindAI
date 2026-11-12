const BaseRepository = require('./baseRepository');

class CategoryRepository extends BaseRepository {
  constructor() {
    super('tbl_Category', 'int_Category_Id');
  }

  toDTO(row) {
    if (!row) return null;
    const catIdStr = `cat-${String(row.int_Category_Id).padStart(2, '0')}`;
    return {
      _id: String(row.int_Category_Id),
      id: String(row.int_Category_Id),
      categoryId: catIdStr,
      code: row.txt_Category_Code,
      name: row.txt_Category_Name,
      description: row.txt_Category_Description,
      parentCategoryId: row.int_Parent_Category_Id,
      department: 'Supermarket',
      slug: row.txt_Category_Slug || row.txt_Category_Code?.toLowerCase(),
      image: row.txt_Category_Image_Url,
      displayOrder: row.int_Display_Order || 1,
      isPerishable: this.toBoolean(row.bit_Is_Perishable),
      storageRequirements: 'Ambient',
      isFeatured: this.toBoolean(row.bit_Is_Featured),
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByName(name, connection = null) {
    const sql = `SELECT * FROM tbl_Category WHERE LOWER(txt_Category_Name) = LOWER(?) LIMIT 1`;
    const rows = await this.query(sql, [name], connection);
    return rows[0] || null;
  }

  async findByIdOrName(identifier, connection = null) {
    const numericMatch = String(identifier).match(/\d+/);
    const numericId = numericMatch ? parseInt(numericMatch[0], 10) : (parseInt(identifier, 10) || null);
    const sql = `
      SELECT * FROM tbl_Category 
      WHERE (int_Category_Id = ? OR txt_Category_Code = ? OR LOWER(txt_Category_Name) = LOWER(?))
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [numericId || 0, identifier, identifier], connection);
    return rows[0] || null;
  }

  async createCategory(data, user = 'system', connection = null) {
    const categoryId = data.int_Category_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const slug = (data.txt_Category_Name || data.name || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const sql = `
      INSERT INTO tbl_Category (
        int_Category_Id,
        txt_Category_Code,
        txt_Category_Name,
        txt_Category_Description,
        int_Parent_Category_Id,
        int_Category_Level,
        txt_Category_Image_Url,
        txt_Category_Slug,
        int_Display_Order,
        bit_Is_Perishable,
        bit_Is_Featured,
        bit_Requires_Age_Verification,
        bit_Is_Active_For_Online_Sale,
        dec_Default_Profit_Margin,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      categoryId,
      auditData.txt_Category_Code,
      auditData.txt_Category_Name,
      auditData.txt_Category_Description || null,
      auditData.int_Parent_Category_Id || null,
      auditData.int_Category_Level || 1,
      auditData.txt_Category_Image_Url || null,
      slug,
      auditData.int_Display_Order || 1,
      auditData.bit_Is_Perishable ? 1 : 0,
      auditData.bit_Is_Featured ? 1 : 0,
      auditData.bit_Requires_Age_Verification ? 1 : 0,
      auditData.bit_Is_Active_For_Online_Sale ? 1 : 1,
      auditData.dec_Default_Profit_Margin || auditData.defaultProfitMargin || 0,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Category_Id: categoryId };
  }

  async updateCategory(id, data, user = 'system', connection = null) {
    const auditData = this.withAuditUpdate(data, user);
    const sql = `
      UPDATE tbl_Category
      SET txt_Category_Name = COALESCE(?, txt_Category_Name),
          txt_Category_Description = COALESCE(?, txt_Category_Description),
          txt_Category_Image_Url = COALESCE(?, txt_Category_Image_Url),
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Category_Id = ?
    `;
    const params = [
      data.txt_Category_Name,
      data.txt_Category_Description,
      data.txt_Category_Image_Url,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      id,
    ];
    await this.execute(sql, params, connection);
    return await this.findById(id, connection);
  }
}

module.exports = new CategoryRepository();
