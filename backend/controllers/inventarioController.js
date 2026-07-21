const Insumo = require('../models/Insumo');
const { mockDB } = require('../config/db');

const getInsumos = async (req, res) => {
  try {
    const insumos = await Insumo.getAll();
    res.json(insumos);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar inventario.' });
  }
};

const registrarCompraInsumo = async (req, res) => {
  try {
    const { id_insumo, cantidad_comprada, precio_unitario } = req.body;
    const resultado = await Insumo.registrarCompra(id_insumo, cantidad_comprada, precio_unitario);
    res.status(201).json({ message: 'Compra de mercado e incremento de stock registrados', resultado });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar la compra.' });
  }
};

const getCongeladora = async (req, res) => {
  try {
    res.json(mockDB.congeladora);
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar bandejas de congeladora.' });
  }
};

const registrarCierreCongeladora = async (req, res) => {
  try {
    const { id_insumo, cantidad_congelada, observacion } = req.body;
    const insumo = mockDB.insumos.find(i => i.id_insumo === parseInt(id_insumo, 10));

    const nuevoCierre = {
      id_cierre: mockDB.congeladora.length + 1,
      fecha_cierre: new Date().toISOString().split('T')[0],
      id_insumo,
      insumo: insumo ? insumo.nombre_insumo : 'Insumo',
      cantidad_congelada,
      observacion
    };
    mockDB.congeladora.push(nuevoCierre);
    res.status(201).json({ message: 'Cierre nocturno de congeladora registrado', cierre: nuevoCierre });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar arqueo de congeladora.' });
  }
};

module.exports = {
  getInsumos,
  registrarCompraInsumo,
  getCongeladora,
  registrarCierreCongeladora
};
