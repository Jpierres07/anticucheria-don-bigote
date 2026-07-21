const { getPool, isMock, mockDB } = require('../config/db');

class Mesa {
  static async getAll() {
    if (isMock()) return mockDB.mesas;
    try {
      const pool = await getPool();
      if (!pool) return mockDB.mesas;
      const result = await pool.request().query(`
        SELECT id_mesa, numero_mesa, capacidad, piso, estado_mesa
        FROM Mesa
        ORDER BY piso ASC, numero_mesa ASC
      `);
      return result.recordset;
    } catch (err) {
      return mockDB.mesas;
    }
  }

  static async updateEstado(id_mesa, nuevoEstado) {
    if (isMock()) {
      const mesa = mockDB.mesas.find(m => m.id_mesa === parseInt(id_mesa, 10));
      if (mesa) mesa.estado_mesa = nuevoEstado;
      return mesa;
    }
    try {
      const pool = await getPool();
      if (!pool) return this.updateEstado(id_mesa, nuevoEstado);
      await pool.request()
        .input('id', id_mesa)
        .input('estado', nuevoEstado)
        .query('UPDATE Mesa SET estado_mesa = @estado WHERE id_mesa = @id');
      return { id_mesa, estado_mesa: nuevoEstado };
    } catch (err) {
      return this.updateEstado(id_mesa, nuevoEstado);
    }
  }
}

module.exports = Mesa;
