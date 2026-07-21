const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

const verifyToken = require('../middlewares/authMiddleware');

router.get('/carta', clienteController.getCarta);
router.post('/pedido-qr', clienteController.crearPedidoQR);

router.get('/mis-pedidos', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
}, clienteController.getMisPedidos);

router.post('/reserva', clienteController.crearReserva);
router.post('/resena', clienteController.crearResena);

module.exports = router;
