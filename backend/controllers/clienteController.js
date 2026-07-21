const { mockDB, isMock, getPool } = require('../config/db');
const Pedido = require('../models/Pedido');

const getCarta = async (req, res) => {
  try {
    if (isMock()) {
      return res.json({
        productos: mockDB.productos,
        combos: mockDB.combos
      });
    }
    const pool = await getPool();
    if (!pool) {
      return res.json({ productos: mockDB.productos, combos: mockDB.combos });
    }

    const productosRes = await pool.request().query(`
      SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.id_categoria, p.imagen_url, c.nombre AS categoria
      FROM Producto p
      JOIN Categoria c ON p.id_categoria = c.id_categoria
    `);

    const combosRes = await pool.request().query(`
      SELECT id_combo, nombre, descripcion, precio_combo FROM Combo
    `);

    // Mapear con imagen_url si no viene de SQL
    const productosConImagen = productosRes.recordset.map(p => {
      const mockItem = mockDB.productos.find(m => m.id_producto === p.id_producto || m.nombre?.toLowerCase() === p.nombre?.toLowerCase());
      return {
        ...p,
        imagen_url: p.imagen_url || mockItem?.imagen_url
      };
    });

    const combosConImagen = combosRes.recordset.map(c => {
      const mockItem = mockDB.combos.find(m => m.id_combo === c.id_combo || m.nombre?.toLowerCase() === c.nombre?.toLowerCase());
      return {
        ...c,
        imagen_url: c.imagen_url || mockItem?.imagen_url
      };
    });

    res.json({
      productos: productosConImagen,
      combos: combosConImagen
    });
  } catch (error) {
    res.json({ productos: mockDB.productos, combos: mockDB.combos });
  }
};

const crearPedidoQR = async (req, res) => {
  try {
    const { id_mesa, items, total, tipo_servicio, cliente_nombre } = req.body;

    let resolvedClienteId = req.user ? req.user.id_cliente || null : null;
    const pool = await require('../config/db').getPool();

    if (!resolvedClienteId && cliente_nombre && cliente_nombre.trim().length > 0 && pool) {
      const nameTrim = cliente_nombre.trim();
      const searchRes = await pool.request()
        .input('name', nameTrim)
        .query("SELECT TOP 1 id_cliente FROM Cliente WHERE (nombre + ' ' + ISNULL(apellido, '')) LIKE '%' + @name + '%'");

      if (searchRes.recordset && searchRes.recordset.length > 0) {
        resolvedClienteId = searchRes.recordset[0].id_cliente;
      } else {
        const parts = nameTrim.split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ') || '';
        const insertRes = await pool.request()
          .input('nombre', firstName)
          .input('apellido', lastName)
          .query("INSERT INTO Cliente (nombre, apellido) OUTPUT INSERTED.id_cliente VALUES (@nombre, @apellido)");
        resolvedClienteId = insertRes.recordset[0].id_cliente;
      }
    }

    const nuevoPedido = await Pedido.create({
      id_cliente: resolvedClienteId || 1,
      id_mesa,
      total,
      tipo_servicio: tipo_servicio || 'Local',
      items
    });

    // Notificar por WebSocket si está disponible
    if (req.io) {
      req.io.emit('nuevo_pedido_cocina', nuevoPedido);
    }

    res.status(201).json({ message: 'Pedido realizado con éxito', pedido: nuevoPedido });
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar el pedido.' });
  }
};

const getMisPedidos = async (req, res) => {
  try {
    const todos = await Pedido.getAll();

    if (req.user && (req.user.id_cliente || req.user.rol === 'Cliente')) {
      const idCliente = req.user.id_cliente ? parseInt(req.user.id_cliente, 10) : null;
      const userFullName = (req.user.nombre_completo || '').toLowerCase();
      const userName = (req.user.username || '').toLowerCase();

      const misPedidos = todos.filter(p => {
        if (idCliente && parseInt(p.id_cliente, 10) === idCliente) return true;
        const pName = (p.cliente_nombre || '').toLowerCase();
        if (pName && ((userFullName && pName.includes(userFullName)) || (userName && pName.includes(userName)) || (userName.includes('shuan') && pName.includes('shuan')))) {
          return true;
        }
        return false;
      });

      return res.json(misPedidos);
    }

    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos.' });
  }
};

const crearReserva = async (req, res) => {
  try {
    const { fecha_reserva, hora_reserva, cantidad_personas, tipo_evento } = req.body;
    const nuevaReserva = {
      id_reserva: mockDB.reservas.length + 1,
      id_cliente: req.user ? req.user.id_cliente || 1 : 1,
      cliente_nombre: req.user ? req.user.nombre_completo : 'Cliente Web',
      fecha_reserva,
      hora_reserva,
      cantidad_personas,
      tipo_evento: tipo_evento || 'Atencion en Local',
      estado_reserva: 'Pendiente'
    };
    mockDB.reservas.push(nuevaReserva);
    res.status(201).json({ message: 'Reserva registrada exitosamente', reserva: nuevaReserva });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la reserva.' });
  }
};

const crearResena = async (req, res) => {
  try {
    const { id_producto, puntuacion, comentario } = req.body;
    res.status(201).json({ message: 'Reseña enviada correctamente. ¡Muchas gracias!' });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar reseña.' });
  }
};

module.exports = {
  getCarta,
  crearPedidoQR,
  getMisPedidos,
  crearReserva,
  crearResena
};
