const Mesa = require('../models/Mesa');
const Pedido = require('../models/Pedido');

const getMesas = async (req, res) => {
  try {
    const mesas = await Mesa.getAll();
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar mesas.' });
  }
};

const getClientes = async (req, res) => {
  try {
    const pool = await require('../config/db').getPool();
    if (!pool) return res.json([]);
    const result = await pool.request().query("SELECT id_cliente, nombre, apellido, (nombre + ' ' + ISNULL(apellido, '')) AS nombre_completo FROM Cliente ORDER BY nombre ASC");
    res.json(result.recordset || []);
  } catch (error) {
    res.json([]);
  }
};

const tomarComanda = async (req, res) => {
  try {
    const { id_mesa, items, total, tipo_servicio, id_personal, id_cliente, cliente_nombre } = req.body;

    let resolvedClienteId = id_cliente || null;
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
      id_personal: id_personal || (req.user ? req.user.id_personal : null),
      id_mesa,
      total,
      tipo_servicio: tipo_servicio || 'Local',
      items
    });

    if (req.io) {
      req.io.emit('nuevo_pedido_cocina', nuevoPedido);
    }

    res.status(201).json({ message: 'Comanda enviada a la parrilla', pedido: nuevoPedido });
  } catch (error) {
    console.error('Error en tomarComanda:', error);
    res.status(500).json({ message: 'Error al enviar comanda.' });
  }
};

const cobrarMesa = async (req, res) => {
  try {
    const { id_pedido, id_mesa, id_metodo_pago, monto_pagado } = req.body;
    
    const { isMock, mockDB } = require('../config/db');

    const pool = await require('../config/db').getPool();
    if (pool) {
      await pool.request()
        .input('id', id_pedido)
        .input('metodo', id_metodo_pago || 1)
        .query("UPDATE Pedido SET id_metodo_pago = @metodo, estado_pedido = 'Entregado' WHERE id_pedido = @id");
    } else {
      await Pedido.updateEstado(id_pedido, 'Entregado');
    }

    if (isMock()) {
      const p = mockDB.pedidos.find(x => x.id_pedido === parseInt(id_pedido, 10));
      if (p) {
        p.id_metodo_pago = id_metodo_pago || 1;
        p.estado_pedido = 'Entregado';
      }
    }

    if (id_mesa) {
      await Mesa.updateEstado(id_mesa, 'Libre');
    }

    if (req.io) {
      req.io.emit('mesa_liberada', { id_mesa, id_pedido });
      req.io.emit('cambio_estado_parrilla', { id_pedido, estado_pedido: 'Entregado' });
    }

    res.json({ message: 'Cobro registrado y mesa liberada con éxito' });
  } catch (error) {
    console.error('Error en cobrarMesa:', error.message);
    res.status(500).json({ message: 'Error al procesar el cobro.', error: error.message });
  }
};

module.exports = {
  getMesas,
  getClientes,
  tomarComanda,
  cobrarMesa
};
