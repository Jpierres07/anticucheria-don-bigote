const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/carta', clienteController.getCarta);
router.post('/pedido-qr', clienteController.crearPedidoQR);
router.get('/mis-pedidos', clienteController.getMisPedidos);
router.post('/reserva', clienteController.crearReserva);
router.post('/resena', clienteController.crearResena);

module.exports = router;
