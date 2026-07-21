const { getPool, isMock, mockDB } = require('../config/db');

class Insumo {
  static async getAll() {
    if (isMock()) return mockDB.insumos;
    try {
      const pool = await getPool();
      if (!pool) return mockDB.insumos;
      const result = await pool.request().query(`
        SELECT i.id_insumo, i.nombre_insumo, i.unidad_compra, i.unidad_consumo,
               i.factor_conversion, i.stock_actual, i.id_proveedor, p.razon_social AS proveedor
        FROM Insumo i
        JOIN Proveedor p ON i.id_proveedor = p.id_proveedor
      `);
      return result.recordset;
    } catch (err) {
      return mockDB.insumos;
    }
  }

  static async registrarCompra(id_insumo, cantidad_comprada, precio_unitario) {
    if (isMock()) {
      const insumo = mockDB.insumos.find(i => i.id_insumo === parseInt(id_insumo, 10));
      if (insumo) {
        // Factor de conversión: 1 unidad compra = factor * unidad consumo
        const incrementoStock = cantidad_comprada * insumo.factor_conversion;
        insumo.stock_actual += incrementoStock;
      }
      return insumo;
    }
    try {
      const pool = await getPool();
      if (!pool) return this.registrarCompra(id_insumo, cantidad_comprada, precio_unitario);

      const insumoRes = await pool.request()
        .input('id', id_insumo)
        .query('SELECT factor_conversion FROM Insumo WHERE id_insumo = @id');

      const factor = insumoRes.recordset[0]?.factor_conversion || 1;
      const incremento = cantidad_comprada * factor;

      await pool.request()
        .input('id', id_insumo)
        .input('inc', incremento)
        .query('UPDATE Insumo SET stock_actual = stock_actual + @inc WHERE id_insumo = @id');

      return { id_insumo, stock_actual: 'Actualizado' };
    } catch (err) {
      return this.registrarCompra(id_insumo, cantidad_comprada, precio_unitario);
    }
  }
}

module.exports = Insumo;
