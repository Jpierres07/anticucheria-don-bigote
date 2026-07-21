const { getPool, isMock, mockDB } = require('../config/db');

class Usuario {
  static async findByUsername(username) {
    const cleanUser = (username || '').trim().toLowerCase();
    if (isMock()) {
      return mockDB.usuarios.find(u => (u.username || '').toLowerCase() === cleanUser);
    }
    try {
      const pool = await getPool();
      if (!pool) return mockDB.usuarios.find(u => (u.username || '').toLowerCase() === cleanUser);
      const result = await pool.request()
        .input('username', cleanUser)
        .query(`
          SELECT u.id_usuario, u.username, u.password_hash, u.id_personal, u.id_cliente, u.estado,
                 c.nombre_cargo AS rol,
                 COALESCE(p.nombre + ' ' + p.apellido, cl.nombre + ' ' + cl.apellido) AS nombre_completo
          FROM Usuario u
          LEFT JOIN Personal p ON u.id_personal = p.id_personal
          LEFT JOIN Cargo c ON p.id_cargo = c.id_cargo
          LEFT JOIN Cliente cl ON u.id_cliente = cl.id_cliente
          WHERE LOWER(u.username) = @username
        `);
      const userFound = result.recordset[0];
      if (userFound) return userFound;
      return mockDB.usuarios.find(u => (u.username || '').toLowerCase() === cleanUser);
    } catch (err) {
      console.error('Error en Usuario.findByUsername:', err);
      return mockDB.usuarios.find(u => (u.username || '').toLowerCase() === cleanUser);
    }
  }

  static async getAll() {
    if (isMock()) return mockDB.usuarios;
    try {
      const pool = await getPool();
      if (!pool) return mockDB.usuarios;
      const result = await pool.request().query(`
        SELECT u.id_usuario, u.username, u.id_personal, u.id_cliente, u.estado,
               c.nombre_cargo AS rol,
               COALESCE(p.nombre + ' ' + p.apellido, cl.nombre + ' ' + cl.apellido) AS nombre_completo
        FROM Usuario u
        LEFT JOIN Personal p ON u.id_personal = p.id_personal
        LEFT JOIN Cargo c ON p.id_cargo = c.id_cargo
        LEFT JOIN Cliente cl ON u.id_cliente = cl.id_cliente
      `);
      return result.recordset;
    } catch (err) {
      return mockDB.usuarios;
    }
  }
  static async registerClient({ username, password_hash, nombre, apellido, dni, telefono }) {
    const cleanDni = String(dni || username).replace(/[^0-9]/g, '').slice(0, 8) || String(Math.floor(10000000 + Math.random() * 80000000));
    if (isMock()) {
      const newClient = { id_cliente: mockDB.usuarios.length + 10, nombre, apellido, dni: cleanDni, telefono };
      const newUser = {
        id_usuario: mockDB.usuarios.length + 1,
        username,
        password_hash,
        id_cliente: newClient.id_cliente,
        id_personal: null,
        estado: 1,
        rol: 'Cliente',
        nombre_completo: `${nombre} ${apellido}`
      };
      mockDB.usuarios.push(newUser);
      return newUser;
    }
    try {
      const pool = await getPool();
      if (!pool) return this.registerClient({ username, password_hash, nombre, apellido, dni: cleanDni, telefono });

      const clientRes = await pool.request()
        .input('dni', cleanDni)
        .input('nombre', nombre)
        .input('apellido', apellido || '')
        .input('telefono', telefono || '')
        .query(`
          INSERT INTO Cliente (dni, nombre, apellido, telefono)
          OUTPUT INSERTED.id_cliente
          VALUES (@dni, @nombre, @apellido, @telefono)
        `);

      const id_cliente = clientRes.recordset[0].id_cliente;

      const userRes = await pool.request()
        .input('username', username)
        .input('password_hash', password_hash)
        .input('id_cliente', id_cliente)
        .query(`
          INSERT INTO Usuario (username, password_hash, id_cliente, estado)
          OUTPUT INSERTED.id_usuario
          VALUES (@username, @password_hash, @id_cliente, 1)
        `);

      return { id_usuario: userRes.recordset[0].id_usuario, username, rol: 'Cliente' };
    } catch (err) {
      console.error('Error en registerClient:', err);
      throw err;
    }
  }

  static async registerTrabajador({ username, password_hash, nombre, apellido, dni, telefono }) {
    const cleanDni = String(dni || username).replace(/[^0-9]/g, '').slice(0, 8) || String(Math.floor(10000000 + Math.random() * 80000000));
    if (isMock()) {
      const newPersonal = { id_personal: mockDB.usuarios.length + 20, nombre, apellido, dni: cleanDni, telefono };
      const newUser = {
        id_usuario: mockDB.usuarios.length + 1,
        username,
        password_hash,
        id_cliente: null,
        id_personal: newPersonal.id_personal,
        estado: 0,
        rol: 'Atención al Cliente y Limpieza',
        nombre_completo: `${nombre} ${apellido}`
      };
      mockDB.usuarios.push(newUser);
      return newUser;
    }
    try {
      const pool = await getPool();
      if (!pool) return this.registerTrabajador({ username, password_hash, nombre, apellido, dni: cleanDni, telefono });

      const personalRes = await pool.request()
        .input('dni', cleanDni)
        .input('nombre', nombre)
        .input('apellido', apellido || '')
        .input('telefono', telefono || '')
        .query(`
          INSERT INTO Personal (dni, nombre, apellido, telefono, fecha_contratacion, sueldo, id_cargo, estado)
          OUTPUT INSERTED.id_personal
          VALUES (@dni, @nombre, @apellido, @telefono, GETDATE(), 1800, 2, 'Inactivo')
        `);

      const id_personal = personalRes.recordset[0].id_personal;

      const userRes = await pool.request()
        .input('username', username)
        .input('password_hash', password_hash)
        .input('id_personal', id_personal)
        .query(`
          INSERT INTO Usuario (username, password_hash, id_personal, estado)
          OUTPUT INSERTED.id_usuario
          VALUES (@username, @password_hash, @id_personal, 0)
        `);

      return { id_usuario: userRes.recordset[0].id_usuario, username, rol: 'Atención al Cliente y Limpieza', estado: 0 };
    } catch (err) {
      console.error('Error en registerTrabajador:', err);
      throw err;
    }
  }

  static async getPendingWorkers() {
    if (isMock()) {
      return mockDB.usuarios.filter(u => u.estado === 0 || u.estado === false);
    }
    try {
      const pool = await getPool();
      if (!pool) return mockDB.usuarios.filter(u => u.estado === 0 || u.estado === false);

      const res = await pool.request().query(`
        SELECT u.id_usuario, u.username, u.estado, p.nombre, p.apellido, p.dni, p.telefono,
               c.nombre_cargo AS rol
        FROM Usuario u
        JOIN Personal p ON u.id_personal = p.id_personal
        LEFT JOIN Cargo c ON p.id_cargo = c.id_cargo
        WHERE u.estado = 0
      `);
      return res.recordset;
    } catch (err) {
      return mockDB.usuarios.filter(u => u.estado === 0 || u.estado === false);
    }
  }

  static async approveWorker(id_usuario) {
    if (isMock()) {
      const user = mockDB.usuarios.find(u => u.id_usuario === parseInt(id_usuario, 10));
      if (user) user.estado = 1;
      return user;
    }
    try {
      const pool = await getPool();
      if (!pool) return this.approveWorker(id_usuario);

      await pool.request()
        .input('id_usuario', id_usuario)
        .query(`
          UPDATE Usuario SET estado = 1 WHERE id_usuario = @id_usuario;
          UPDATE Personal SET estado = 'Activo' WHERE id_personal = (SELECT id_personal FROM Usuario WHERE id_usuario = @id_usuario);
        `);
      return { id_usuario, estado: 1 };
    } catch (err) {
      return this.approveWorker(id_usuario);
    }
  }

  static async updatePassword(id_usuario, newPasswordHash) {
    if (isMock()) {
      const u = mockDB.usuarios.find(x => x.id_usuario === parseInt(id_usuario, 10));
      if (u) u.password_hash = newPasswordHash;
      return true;
    }
    try {
      const pool = await getPool();
      if (!pool) return true;
      await pool.request()
        .input('id', id_usuario)
        .input('pass', newPasswordHash)
        .query('UPDATE Usuario SET password_hash = @pass WHERE id_usuario = @id');
      return true;
    } catch (err) {
      return false;
    }
  }

  static async updatePersonalData(id_usuario, { nombre, apellido, telefono }) {
    if (isMock()) {
      const u = mockDB.usuarios.find(x => x.id_usuario === parseInt(id_usuario, 10));
      if (u) u.nombre = `${nombre} ${apellido || ''}`.trim();
      return true;
    }
    try {
      const pool = await getPool();
      if (!pool) return true;

      const userRes = await pool.request().input('id', id_usuario).query('SELECT id_personal, id_cliente FROM Usuario WHERE id_usuario = @id');
      const u = userRes.recordset[0];

      if (u && u.id_personal) {
        await pool.request()
          .input('id', u.id_personal)
          .input('nom', nombre)
          .input('ape', apellido || '')
          .input('tel', telefono || '')
          .query('UPDATE Personal SET nombre = ISNULL(@nom, nombre), apellido = ISNULL(@ape, apellido), telefono = ISNULL(@tel, telefono) WHERE id_personal = @id');
      } else if (u && u.id_cliente) {
        await pool.request()
          .input('id', u.id_cliente)
          .input('nom', nombre)
          .input('ape', apellido || '')
          .input('tel', telefono || '')
          .query('UPDATE Cliente SET nombre = ISNULL(@nom, nombre), apellido = ISNULL(@ape, apellido), telefono = ISNULL(@tel, telefono) WHERE id_cliente = @id');
      }
      return true;
    } catch (err) {
      return false;
    }
  }
}

module.exports = Usuario;
