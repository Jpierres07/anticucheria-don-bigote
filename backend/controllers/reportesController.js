const { mockDB, getPool } = require('../config/db');

const getDashboardMetrics = async (req, res) => {
  try {
    const totalPedidos = mockDB.pedidos.length;
    const ingresosTotales = mockDB.pedidos.reduce((acc, p) => acc + p.total, 0);
    const insumosCriticos = mockDB.insumos.filter(i => i.stock_actual < 30);
    const totalReservas = mockDB.reservas.length;

    res.json({
      resumen: {
        totalPedidos,
        ingresosTotales,
        insumosCriticosCount: insumosCriticos.length,
        totalReservas
      },
      ventasPorMetodo: [
        { metodo: 'Efectivo', monto: ingresosTotales * 0.45 },
        { metodo: 'Yape', monto: ingresosTotales * 0.35 },
        { metodo: 'Plin', monto: ingresosTotales * 0.10 },
        { metodo: 'Tarjeta', monto: ingresosTotales * 0.10 }
      ],
      platillosMasVendidos: [
        { nombre: 'Anticuchos de Corazón', ventas: 42 },
        { nombre: 'Rachi Rachi', ventas: 35 },
        { nombre: 'Pollo a la Parrilla', ventas: 28 },
        { nombre: 'Trío Parrillero Don Bigote', ventas: 19 }
      ],
      insumosCriticos
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar datos del dashboard.' });
  }
};

const getReporteVentas = async (req, res) => {
  try {
    const { periodo = 'diario', mozo = 'todos', fecha } = req.query;

    const pool = await getPool();
    if (pool) {
      const targetFecha = fecha || new Date().toISOString().split('T')[0];
      let dateCondition = "1=1";

      if (periodo === 'todos' || periodo === 'historico') {
        dateCondition = "1=1";
      } else if (fecha || periodo === 'dia') {
        dateCondition = "CAST(p.fecha_pedido AS DATE) = CAST(@fecha AS DATE)";
      } else if (periodo === 'diario') {
        dateCondition = "CAST(p.fecha_pedido AS DATE) = CAST(GETDATE() AS DATE)";
      } else if (periodo === 'semanal') {
        dateCondition = "p.fecha_pedido >= DATEADD(day, -7, GETDATE())";
      } else if (periodo === 'mensual') {
        dateCondition = "MONTH(p.fecha_pedido) = MONTH(GETDATE()) AND YEAR(p.fecha_pedido) = YEAR(GETDATE())";
      }

      let mozoCondition = "";
      if (mozo !== 'todos') {
        mozoCondition = " AND (u.username = @mozo OR per.nombre LIKE '%' + @mozo + '%')";
      }

      // Productos y Combos Vendidos
      const prodsRes = await pool.request()
        .input('mozo', mozo)
        .input('fecha', targetFecha)
        .query(`
          SELECT 
            COALESCE(prod.nombre, c.nombre, 'Anticuchos Tradicionales') AS producto,
            COALESCE(cat.nombre, 'Platillos') AS categoria,
            SUM(dp.cantidad) AS cantidad_vendida,
            MAX(dp.precio_unitario) AS precio_unitario,
            SUM(dp.cantidad * dp.precio_unitario) AS total_generado
          FROM DetallePedido dp
          JOIN Pedido p ON dp.id_pedido = p.id_pedido
          LEFT JOIN Producto prod ON dp.id_producto = prod.id_producto
          LEFT JOIN Categoria cat ON prod.id_categoria = cat.id_categoria
          LEFT JOIN Combo c ON dp.id_combo = c.id_combo
          LEFT JOIN Personal per ON p.id_personal = per.id_personal
          LEFT JOIN Usuario u ON per.id_personal = u.id_personal
          WHERE ${dateCondition} ${mozoCondition}
          GROUP BY COALESCE(prod.nombre, c.nombre, 'Anticuchos Tradicionales'), COALESCE(cat.nombre, 'Platillos')
          ORDER BY total_generado DESC
        `);

      // Ventas por Mozo
      const mozosRes = await pool.request()
        .input('mozo', mozo)
        .input('fecha', targetFecha)
        .query(`
          SELECT 
            COALESCE(per.nombre + ' ' + per.apellido, 'Sra. Norma (Admin)') AS mozo_nombre,
            COUNT(p.id_pedido) AS cantidad_pedidos,
            SUM(p.total) AS total_vendido
          FROM Pedido p
          LEFT JOIN Personal per ON p.id_personal = per.id_personal
          LEFT JOIN Usuario u ON per.id_personal = u.id_personal
          WHERE ${dateCondition} ${mozoCondition}
          GROUP BY COALESCE(per.nombre + ' ' + per.apellido, 'Sra. Norma (Admin)')
        `);

      // Ventas por Día (Reporte Histórico Diario)
      const diasRes = await pool.request()
        .input('mozo', mozo)
        .input('fecha', targetFecha)
        .query(`
          SELECT 
            CONVERT(VARCHAR(10), p.fecha_pedido, 120) AS fecha,
            COUNT(DISTINCT p.id_pedido) AS cantidad_pedidos,
            SUM(p.total) AS total_ventas
          FROM Pedido p
          LEFT JOIN Personal per ON p.id_personal = per.id_personal
          LEFT JOIN Usuario u ON per.id_personal = u.id_personal
          WHERE ${dateCondition} ${mozoCondition}
          GROUP BY CONVERT(VARCHAR(10), p.fecha_pedido, 120)
          ORDER BY fecha DESC
        `);

      // Listado de Transacciones
      const pedidosRes = await pool.request()
        .input('mozo', mozo)
        .input('fecha', targetFecha)
        .query(`
          SELECT TOP 100
            p.id_pedido,
            p.fecha_pedido,
            p.id_mesa,
            p.total,
            p.tipo_servicio,
            p.estado_pedido,
            COALESCE(per.nombre + ' ' + per.apellido, 'Sra. Norma (Admin)') AS mozo_nombre
          FROM Pedido p
          LEFT JOIN Personal per ON p.id_personal = per.id_personal
          LEFT JOIN Usuario u ON per.id_personal = u.id_personal
          WHERE ${dateCondition} ${mozoCondition}
          ORDER BY p.fecha_pedido DESC
        `);

      // Ventas por Cliente Frecuente
      const clientesRes = await pool.request()
        .input('mozo', mozo)
        .input('fecha', targetFecha)
        .query(`
          SELECT 
            COALESCE(cl.nombre + ' ' + cl.apellido, 'Cliente Salón / QR') AS cliente_nombre,
            COUNT(p.id_pedido) AS cantidad_pedidos,
            SUM(p.total) AS total_consumido
          FROM Pedido p
          LEFT JOIN Cliente cl ON p.id_cliente = cl.id_cliente
          LEFT JOIN Personal per ON p.id_personal = per.id_personal
          LEFT JOIN Usuario u ON per.id_personal = u.id_personal
          WHERE ${dateCondition} ${mozoCondition}
          GROUP BY COALESCE(cl.nombre + ' ' + cl.apellido, 'Cliente Salón / QR')
          ORDER BY total_consumido DESC
        `);

      // Lista Completa de Personal Registrado en BD
      const allPersonalRes = await pool.request().query(`
        SELECT per.id_personal, 
               per.nombre + ' ' + ISNULL(per.apellido, '') AS nombre_completo, 
               ISNULL(u.username, LOWER(per.nombre)) AS username, 
               ISNULL(c.nombre_cargo, 'Personal') AS cargo
        FROM Personal per
        LEFT JOIN Usuario u ON per.id_personal = u.id_personal
        LEFT JOIN Cargo c ON per.id_cargo = c.id_cargo
      `);

      const prods = prodsRes.recordset || [];
      const mozos = mozosRes.recordset || [];
      const clientes = clientesRes.recordset || [];
      const peds = pedidosRes.recordset || [];
      const ventasPorDia = diasRes.recordset || [];
      const personalList = allPersonalRes.recordset || [];

      return res.json({
        periodo,
        mozo,
        resumen: {
          totalVentas: prods.reduce((a, b) => a + Number(b.total_generado || 0), 0),
          totalPedidos: peds.length,
          totalProductos: prods.reduce((a, b) => a + Number(b.cantidad_vendida || 0), 0)
        },
        productosVendidos: prods,
        ventasPorMozo: mozos,
        ventasPorCliente: clientes,
        ventasPorDia,
        pedidos: peds,
        personalList
      });
    }

    // Fallback Mock Data
    const mockPersonalList = [
      { username: 'edgar.milla', nombre_completo: 'Edgar Milla Pajuelo', cargo: 'Mozo 1' },
      { username: 'tania.espinoza', nombre_completo: 'Tania Espinoza Shuan', cargo: 'Mozo 2' },
      { username: 'norma.shuan', nombre_completo: 'Sra. Norma Shuan', cargo: 'Administradora' }
    ];

    let filteredPeds = [...mockDB.pedidos];

    if (mozo !== 'todos') {
      filteredPeds = filteredPeds.filter(p => {
        if (mozo === 'edgar.milla' && p.id_personal === 2) return true;
        if (mozo === 'tania.espinoza' && p.id_personal === 3) return true;
        return false;
      });
    }

    if (periodo === 'dia' && fecha) {
      filteredPeds = filteredPeds.filter(p => p.fecha_pedido && p.fecha_pedido.startsWith(fecha));
    }

    // Agrupar ventas por día
    const ventasPorDiaMap = {};
    filteredPeds.forEach(p => {
      const dia = p.fecha_pedido ? p.fecha_pedido.split('T')[0] : '2026-07-21';
      if (!ventasPorDiaMap[dia]) {
        ventasPorDiaMap[dia] = { fecha: dia, cantidad_pedidos: 0, total_ventas: 0, productos_vendidos: 0 };
      }
      ventasPorDiaMap[dia].cantidad_pedidos += 1;
      ventasPorDiaMap[dia].total_ventas += (p.total || 0);
      const cantProds = p.detalles ? p.detalles.reduce((sum, d) => sum + (d.cantidad || 1), 0) : 2;
      ventasPorDiaMap[dia].productos_vendidos += cantProds;
    });

    const ventasPorDia = Object.values(ventasPorDiaMap).sort((a, b) => b.fecha.localeCompare(a.fecha));

    const mockProds = [
      { producto: 'Anticuchos de Corazón', categoria: 'Platillos', cantidad_vendida: 38, precio_unitario: 12.00, total_generado: 456.00 },
      { producto: 'Rachi Rachi', categoria: 'Platillos', cantidad_vendida: 24, precio_unitario: 16.00, total_generado: 384.00 },
      { producto: 'Pollo a la Parrilla', categoria: 'Platillos', cantidad_vendida: 18, precio_unitario: 16.00, total_generado: 288.00 },
      { producto: 'Combo Pollo + Rachi', categoria: 'Combos', cantidad_vendida: 12, precio_unitario: 30.00, total_generado: 360.00 },
      { producto: 'Chicha Morada 1 Litro', categoria: 'Bebidas', cantidad_vendida: 15, precio_unitario: 10.00, total_generado: 150.00 }
    ];

    const mockMozos = [
      { mozo_nombre: 'Edgar Milla Pajuelo', cantidad_pedidos: 14, total_vendido: 840.00 },
      { mozo_nombre: 'Tania Espinoza Shuan', cantidad_pedidos: 10, total_vendido: 620.00 },
      { mozo_nombre: 'Sra. Norma Shuan (Admin)', cantidad_pedidos: 6, total_vendido: 380.00 }
    ];

    res.json({
      periodo,
      mozo,
      resumen: {
        totalVentas: filteredPeds.reduce((a, b) => a + Number(b.total || 0), 0),
        totalPedidos: filteredPeds.length,
        totalProductos: filteredPeds.reduce((a, b) => a + (b.detalles ? b.detalles.reduce((sum, d) => sum + (d.cantidad || 1), 0) : 2), 0)
      },
      productosVendidos: mockProds,
      ventasPorMozo: mockMozos,
      ventasPorDia,
      pedidos: filteredPeds,
      personalList: mockPersonalList
    });
  } catch (error) {
    console.error('Error en reportesController:', error);
    res.status(500).json({ message: 'Error al generar reporte de ventas.' });
  }
};

module.exports = {
  getDashboardMetrics,
  getReporteVentas
};
