const express = require('express');
const router = express.Router();
const cocinaController = require('../controllers/cocinaController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/pedidos', verifyToken, cocinaController.getPedidosCocina);
router.put('/pedidos/:id_pedido/estado', verifyToken, cocinaController.actualizarEstadoParrilla);

module.exports = router;
