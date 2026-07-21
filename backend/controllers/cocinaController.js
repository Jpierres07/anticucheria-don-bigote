const Pedido = require('../models/Pedido');

const getPedidosCocina = async (req, res) => {
  try {
    const todos = await Pedido.getAll();
    // Devolver todas las comandas que no han sido canceladas
    const activos = todos.filter(p => p.estado_pedido !== 'Cancelado');
    res.json(activos);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar comandas de cocina.' });
  }
};

const actualizarEstadoParrilla = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    const { estado_pedido } = req.body;

    const actualizado = await Pedido.updateEstado(id_pedido, estado_pedido);

    if (req.io) {
      const ped = await Pedido.getById(id_pedido);
      const payload = {
        id_pedido: parseInt(id_pedido, 10),
        estado_pedido,
        id_mesa: ped?.id_mesa || 1,
        numero_mesa: ped?.numero_mesa || ped?.id_mesa || 1,
        id_personal: ped?.id_personal || null,
        mozo_nombre: ped?.mozo_nombre || null
      };

      req.io.emit('cambio_estado_parrilla', payload);
      req.io.emit('comanda_lista_mozo', payload);
    }

    res.json({ message: `Estado de comanda actualizado a ${estado_pedido}`, pedido: actualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado en parrilla.' });
  }
};

module.exports = {
  getPedidosCocina,
  actualizarEstadoParrilla
};
