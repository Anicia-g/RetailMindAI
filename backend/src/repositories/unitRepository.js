const BaseRepository = require('./baseRepository');

class UnitRepository extends BaseRepository {
  constructor() {
    super('tbl_Unit', 'int_Unit_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Unit_Id),
      id: String(row.int_Unit_Id),
      unitId: row.int_Unit_Id,
      code: row.txt_Unit_Code,
      name: row.txt_Unit_Name,
      symbol: row.txt_Unit_Symbol || '',
      unitSymbol: row.txt_Unit_Symbol || '',
      type: row.txt_Unit_Type || 'Quantity',
      conversionFactor: Number(row.dec_Conversion_Factor || 1),
      isBaseUnit: this.toBoolean(row.bit_Is_Base_Unit),
      allowsDecimal: this.toBoolean(row.bit_Allows_Decimal),
      decimalPlaces: Number(row.int_Decimal_Places || 0),
      isCustomUnit: this.toBoolean(row.bit_Is_Custom_Unit),
      isPurchaseUnit: this.toBoolean(row.bit_Is_Purchase_Unit),
      isSalesUnit: this.toBoolean(row.bit_Is_Sales_Unit),
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findBySymbolOrName(identifier, connection = null) {
    const sql = `
      SELECT * FROM tbl_Unit 
      WHERE (txt_Unit_Symbol = ? OR txt_Unit_Code = ? OR LOWER(txt_Unit_Name) = LOWER(?)) 
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [identifier, identifier, identifier], connection);
    return rows[0] || null;
  }

  async createUnit(data, user = 'system', connection = null) {
    const unitId = data.int_Unit_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const symbol = auditData.txt_Unit_Symbol || auditData.symbol || 'unit';
    const code = auditData.txt_Unit_Code || `UNIT-${unitId}`;
    const sql = `
      INSERT INTO tbl_Unit (
        int_Unit_Id,
        txt_Unit_Code,
        txt_Unit_Name,
        txt_Unit_Symbol,
        txt_Unit_Type,
        dec_Conversion_Factor,
        bit_Is_Base_Unit,
        bit_Allows_Decimal,
        int_Decimal_Places,
        bit_Is_Custom_Unit,
        bit_Is_Purchase_Unit,
        bit_Is_Sales_Unit,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      unitId,
      code,
      auditData.txt_Unit_Name,
      symbol,
      auditData.txt_Unit_Type || 'Quantity',
      auditData.dec_Conversion_Factor != null ? auditData.dec_Conversion_Factor : 1.0,
      auditData.bit_Is_Base_Unit !== undefined ? (auditData.bit_Is_Base_Unit ? 1 : 0) : 1,
      auditData.bit_Allows_Decimal ? 1 : 0,
      auditData.int_Decimal_Places || 0,
      auditData.bit_Is_Custom_Unit ? 1 : 0,
      auditData.bit_Is_Purchase_Unit !== undefined ? (auditData.bit_Is_Purchase_Unit ? 1 : 0) : 1,
      auditData.bit_Is_Sales_Unit !== undefined ? (auditData.bit_Is_Sales_Unit ? 1 : 0) : 1,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Unit_Id: unitId };
  }
}

module.exports = new UnitRepository();

