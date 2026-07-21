const { getPool, isMock, mockDB } = require('../config/db');

class Producto {
  static async getAll() {
    if (isMock()) {
      return mockDB.productos;
    }
    const pool = await getPool();
    if (!pool) return mockDB.productos;

    const res = await pool.request().query(`
      SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.id_categoria, p.imagen_url, c.nombre AS categoria
      FROM Producto p
      LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
      ORDER BY p.id_producto DESC
    `);
    return res.recordset;
  }

  static async create({ nombre, descripcion, precio, id_categoria, imagen_url }) {
    const parsedPrecio = parseFloat(precio) || 0;
    const catId = parseInt(id_categoria, 10) || 1;

    if (isMock()) {
      const newId = mockDB.productos.length > 0 
        ? Math.max(...mockDB.productos.map(p => p.id_producto)) + 1 
        : 1;
      
      const catMap = { 1: 'Platillos', 2: 'Combos', 3: 'Bebidas' };
      const nuevo = {
        id_producto: newId,
        nombre,
        descripcion: descripcion || '',
        precio: parsedPrecio,
        id_categoria: catId,
        categoria: catMap[catId] || 'Platillos',
        imagen_url: imagen_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
      };
      mockDB.productos.unshift(nuevo);
      return nuevo;
    }

    const pool = await getPool();
    if (!pool) {
      // Fallback
      const newId = mockDB.productos.length > 0 ? Math.max(...mockDB.productos.map(p => p.id_producto)) + 1 : 1;
      const nuevo = {
        id_producto: newId,
        nombre,
        descripcion: descripcion || '',
        precio: parsedPrecio,
        id_categoria: catId,
        categoria: catId === 3 ? 'Bebidas' : 'Platillos',
        imagen_url
      };
      mockDB.productos.unshift(nuevo);
      return nuevo;
    }

    const res = await pool.request()
      .input('nombre', nombre)
      .input('descripcion', descripcion || '')
      .input('precio', parsedPrecio)
      .input('id_categoria', catId)
      .input('imagen_url', imagen_url || '')
      .query(`
        INSERT INTO Producto (nombre, descripcion, precio, id_categoria, imagen_url)
        OUTPUT INSERTED.id_producto, INSERTED.nombre, INSERTED.descripcion, INSERTED.precio, INSERTED.id_categoria, INSERTED.imagen_url
        VALUES (@nombre, @descripcion, @precio, @id_categoria, @imagen_url)
      `);

    return res.recordset[0];
  }

  static async update(id, { nombre, descripcion, precio, id_categoria, imagen_url }) {
    const parsedId = parseInt(id, 10);
    const parsedPrecio = parseFloat(precio);
    const catId = parseInt(id_categoria, 10);

    if (isMock()) {
      const idx = mockDB.productos.findIndex(p => p.id_producto === parsedId);
      if (idx !== -1) {
        const catMap = { 1: 'Platillos', 2: 'Combos', 3: 'Bebidas' };
        mockDB.productos[idx] = {
          ...mockDB.productos[idx],
          nombre: nombre !== undefined ? nombre : mockDB.productos[idx].nombre,
          descripcion: descripcion !== undefined ? descripcion : mockDB.productos[idx].descripcion,
          precio: !isNaN(parsedPrecio) ? parsedPrecio : mockDB.productos[idx].precio,
          id_categoria: !isNaN(catId) ? catId : mockDB.productos[idx].id_categoria,
          categoria: catMap[catId] || mockDB.productos[idx].categoria,
          imagen_url: imagen_url !== undefined ? imagen_url : mockDB.productos[idx].imagen_url
        };
        return mockDB.productos[idx];
      }
      return null;
    }

    const pool = await getPool();
    if (!pool) return null;

    const res = await pool.request()
      .input('id_producto', parsedId)
      .input('nombre', nombre)
      .input('descripcion', descripcion)
      .input('precio', parsedPrecio)
      .input('id_categoria', catId)
      .input('imagen_url', imagen_url)
      .query(`
        UPDATE Producto
        SET nombre = @nombre, descripcion = @descripcion, precio = @precio, id_categoria = @id_categoria, imagen_url = @imagen_url
        OUTPUT INSERTED.id_producto, INSERTED.nombre, INSERTED.descripcion, INSERTED.precio, INSERTED.id_categoria, INSERTED.imagen_url
        WHERE id_producto = @id_producto
      `);

    return res.recordset[0] || null;
  }

  static async delete(id) {
    const parsedId = parseInt(id, 10);

    if (isMock()) {
      const idx = mockDB.productos.findIndex(p => p.id_producto === parsedId);
      if (idx !== -1) {
        mockDB.productos.splice(idx, 1);
        return true;
      }
      return false;
    }

    const pool = await getPool();
    if (!pool) return false;

    await pool.request()
      .input('id_producto', parsedId)
      .query('DELETE FROM Producto WHERE id_producto = @id_producto');

    return true;
  }
}

module.exports = Producto;
