const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const reportesController = require('../controllers/reportesController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');

const adminOnly = [verifyToken, authorizeRoles('Administradora, Parrillera y Ventas')];

router.get('/dashboard', adminOnly, reportesController.getDashboardMetrics);
router.get('/reportes/ventas', adminOnly, reportesController.getReporteVentas);
router.get('/inventario', adminOnly, inventarioController.getInsumos);
router.post('/inventario/compras', adminOnly, inventarioController.registrarCompraInsumo);
router.get('/congeladora', adminOnly, inventarioController.getCongeladora);
router.post('/congeladora/cierre', adminOnly, inventarioController.registrarCierreCongeladora);

module.exports = router;
