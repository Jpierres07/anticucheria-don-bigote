const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/mesas', verifyToken, salonController.getMesas);
router.get('/clientes', salonController.getClientes);
router.post('/comanda', verifyToken, salonController.tomarComanda);
router.post('/cobrar', verifyToken, salonController.cobrarMesa);

module.exports = router;
