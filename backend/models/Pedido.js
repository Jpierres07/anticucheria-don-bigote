const { getPool, isMock, mockDB } = require('../config/db');

class Pedido {
  static async getAll() {
    if (isMock()) return mockDB.pedidos;
    try {
      const pool = await getPool();
      if (!pool) return mockDB.pedidos;
      const result = await pool.request().query(`
        SELECT p.id_pedido, p.id_cliente, 
               CASE 
                 WHEN p.id_cliente = 1 AND p.id_personal IS NOT NULL THEN 'Cliente Salón (Mesa ' + CAST(ISNULL(p.id_mesa, 1) AS VARCHAR) + ')'
                 WHEN p.id_cliente = 1 AND p.id_mesa IS NOT NULL THEN 'Cliente Salón (Mesa ' + CAST(p.id_mesa AS VARCHAR) + ')'
                 ELSE COALESCE(cl.nombre + ' ' + cl.apellido, 'Cliente Salón')
               END AS cliente_nombre,
               p.id_personal, p.id_mesa, m.numero_mesa, p.fecha_pedido, p.total,
               p.estado_pedido, p.tipo_servicio, p.id_metodo_pago
        FROM Pedido p
        LEFT JOIN Cliente cl ON p.id_cliente = cl.id_cliente
        LEFT JOIN Mesa m ON p.id_mesa = m.id_mesa
        ORDER BY p.fecha_pedido DESC
      `);
      
      const pedidos = result.recordset || [];

      // Cargar detalles de platillos para cada pedido
      for (let p of pedidos) {
        const detallesRes = await pool.request()
          .input('id_pedido', p.id_pedido)
          .query(`
            SELECT dp.cantidad, dp.precio_unitario, 
                   COALESCE(prod.nombre, c.nombre, 'Anticuchos Tradicionales') AS nombre
            FROM DetallePedido dp
            LEFT JOIN Producto prod ON dp.id_producto = prod.id_producto
            LEFT JOIN Combo c ON dp.id_combo = c.id_combo
            WHERE dp.id_pedido = @id_pedido
          `);
        p.detalles = detallesRes.recordset || [];
      }

      return pedidos;
    } catch (err) {
      console.error('Error en Pedido.getAll:', err);
      return mockDB.pedidos;
    }
  }

  static async getById(id) {
    if (isMock()) return mockDB.pedidos.find(p => p.id_pedido === parseInt(id, 10));
    try {
      const pool = await getPool();
      if (!pool) return mockDB.pedidos.find(p => p.id_pedido === parseInt(id, 10));
      const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM Pedido WHERE id_pedido = @id');
      return result.recordset[0];
    } catch (err) {
      return mockDB.pedidos.find(p => p.id_pedido === parseInt(id, 10));
    }
  }

  static async create(pedidoData) {
    const { id_cliente, id_personal, id_mesa, total, tipo_servicio, items } = pedidoData;
    
    // MOCK DATA FALLBACK
    if (isMock()) {
      // Buscar pedido activo en la misma mesa
      if (id_mesa) {
        const existing = mockDB.pedidos.find(p => p.id_mesa === id_mesa && p.estado_pedido !== 'Entregado' && p.estado_pedido !== 'Cancelado');
        if (existing) {
          if (items && items.length > 0) {
            items.forEach(item => {
              const match = existing.detalles.find(d => (d.id_producto && d.id_producto === item.id_producto) || (d.id_combo && d.id_combo === item.id_combo));
              if (match) {
                match.cantidad = item.cantidad || match.cantidad;
              } else {
                existing.detalles.push(item);
              }
            });
          }
          existing.total = existing.detalles.reduce((acc, d) => acc + ((d.cantidad || 1) * (d.precio || d.precio_combo || 15)), 0);
          return existing;
        }
      }

      const newId = mockDB.pedidos.length > 0 ? Math.max(...mockDB.pedidos.map(p => p.id_pedido)) + 1 : 101;
      const newPedido = {
        id_pedido: newId,
        id_cliente: id_cliente || 1,
        cliente_nombre: 'Cliente de Mesa',
        id_personal: id_personal || null,
        id_mesa: id_mesa || null,
        numero_mesa: id_mesa ? id_mesa : null,
        fecha_pedido: new Date().toISOString(),
        total: total || 0,
        estado_pedido: 'En Proceso',
        tipo_servicio: tipo_servicio || 'Local',
        detalles: items || []
      };
      mockDB.pedidos.unshift(newPedido);
      if (id_mesa) {
        const mesa = mockDB.mesas.find(m => m.id_mesa === id_mesa);
        if (mesa) mesa.estado_mesa = 'Ocupada';
      }
      return newPedido;
    }

    // SQL SERVER BD PERSISTENTE
    try {
      const pool = await getPool();
      if (!pool) throw new Error('Database connection not available');

      let targetPedidoId = null;

      // 1. Buscar si la mesa ya tiene una comanda activa sin pagar (id_metodo_pago IS NULL)
      if (id_mesa) {
        const activeRes = await pool.request()
          .input('id_mesa', id_mesa)
          .query(`
            SELECT TOP 1 id_pedido, total 
            FROM Pedido 
            WHERE id_mesa = @id_mesa AND id_metodo_pago IS NULL AND estado_pedido NOT IN ('Pagado', 'Cancelado')
            ORDER BY fecha_pedido DESC
          `);

        if (activeRes.recordset && activeRes.recordset.length > 0) {
          targetPedidoId = activeRes.recordset[0].id_pedido;
        }
      }

      // 2. Si no hay comanda activa, crear un nuevo registro de pedido
      if (!targetPedidoId) {
        const insertResult = await pool.request()
          .input('id_cliente', id_cliente || 1)
          .input('id_personal', id_personal || null)
          .input('id_mesa', id_mesa || null)
          .input('tipo_servicio', tipo_servicio || 'Local')
          .query(`
            INSERT INTO Pedido (id_cliente, id_personal, id_mesa, total, estado_pedido, tipo_servicio)
            OUTPUT INSERTED.id_pedido
            VALUES (@id_cliente, @id_personal, @id_mesa, 0, 'En Proceso', @tipo_servicio)
          `);
        targetPedidoId = insertResult.recordset[0].id_pedido;

        if (id_mesa) {
          await pool.request()
            .input('id_mesa', id_mesa)
            .query("UPDATE Mesa SET estado_mesa = 'Ocupada' WHERE id_mesa = @id_mesa");
        }
      }

      // 3. Insertar o incrementar la cantidad de ítems en DetallePedido
      if (items && items.length > 0) {
        for (let item of items) {
          const prodId = item.id_producto || (item.id && !item.id_combo ? item.id : null);
          const comboId = item.id_combo || null;
          const qty = item.cantidad || 1;
          const price = item.precio || item.precio_combo || item.precio_unitario || 15.00;

          if (prodId || comboId) {
            // Verificar si el ítem ya está en la comanda activa
            const existingItemRes = await pool.request()
              .input('id_pedido', targetPedidoId)
              .input('id_producto', prodId)
              .input('id_combo', comboId)
              .query(`
                SELECT id_detalle_pedido, cantidad 
                FROM DetallePedido 
                WHERE id_pedido = @id_pedido 
                  AND ((@id_producto IS NOT NULL AND id_producto = @id_producto) OR (@id_combo IS NOT NULL AND id_combo = @id_combo))
              `);

            if (existingItemRes.recordset && existingItemRes.recordset.length > 0) {
              // Si el ítem ya está en la comanda activa, asegurar la cantidad exacta enviada
              const detailId = existingItemRes.recordset[0].id_detalle_pedido;
              await pool.request()
                .input('id_detalle_pedido', detailId)
                .input('cantidad_extra', qty)
                .query(`
                  UPDATE DetallePedido 
                  SET cantidad = cantidad + @cantidad_extra 
                  WHERE id_detalle_pedido = @id_detalle_pedido
                `);
            } else {
              // Insertar nuevo renglón de detalle
              await pool.request()
                .input('id_pedido', targetPedidoId)
                .input('id_producto', prodId)
                .input('id_combo', comboId)
                .input('cantidad', qty)
                .input('precio_unitario', price)
                .query(`
                  INSERT INTO DetallePedido (id_pedido, id_producto, id_combo, cantidad, precio_unitario)
                  VALUES (@id_pedido, @id_producto, @id_combo, @cantidad, @precio_unitario)
                `);
            }
          }
        }
      }

      // 4. Recalcular el monto total EXACTO sumando el detalle físico en SQL Server
      const finalTotalRes = await pool.request()
        .input('id_pedido', targetPedidoId)
        .query(`
          UPDATE Pedido 
          SET total = (SELECT ISNULL(SUM(cantidad * precio_unitario), 0) FROM DetallePedido WHERE id_pedido = @id_pedido),
              estado_pedido = 'En Proceso'
          OUTPUT INSERTED.total
          WHERE id_pedido = @id_pedido
        `);

      const calculatedTotal = finalTotalRes.recordset[0]?.total ?? 0;

      return { id_pedido: targetPedidoId, id_mesa, total: calculatedTotal, estado_pedido: 'En Proceso' };
    } catch (err) {
      console.error('Error en Pedido.create:', err.message);
      return { id_pedido: Date.now(), id_mesa, total: total || 0, estado_pedido: 'En Proceso' };
    }
  }

  static async updateEstado(id, nuevoEstado) {
    if (isMock()) {
      const pedido = mockDB.pedidos.find(p => p.id_pedido === parseInt(id, 10));
      if (pedido) {
        pedido.estado_pedido = nuevoEstado;
        if (nuevoEstado === 'Pagado' || nuevoEstado === 'Cancelado') {
          if (pedido.id_mesa) {
            const mesa = mockDB.mesas.find(m => m.id_mesa === pedido.id_mesa);
            if (mesa) mesa.estado_mesa = 'Libre';
          }
        }
      }
      return pedido;
    }
    try {
      const pool = await getPool();
      if (!pool) return this.updateEstado(id, nuevoEstado);
      await pool.request()
        .input('id', id)
        .input('estado', nuevoEstado)
        .query('UPDATE Pedido SET estado_pedido = @estado WHERE id_pedido = @id');
      
      if (nuevoEstado === 'Pagado' || nuevoEstado === 'Cancelado') {
        const ped = await this.getById(id);
        if (ped && ped.id_mesa) {
          await pool.request()
            .input('id_mesa', ped.id_mesa)
            .query("UPDATE Mesa SET estado_mesa = 'Libre' WHERE id_mesa = @id_mesa");
        }
      }
      return { id_pedido: id, estado_pedido: nuevoEstado };
    } catch (err) {
      return this.updateEstado(id, nuevoEstado);
    }
  }
}

module.exports = Pedido;
