const Producto = require('../models/Producto');

const getPlatillos = async (req, res) => {
  try {
    const productos = await Producto.getAll();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener platillos:', error);
    res.status(500).json({ message: 'Error al obtener la lista de platillos.' });
  }
};

const crearPlatillo = async (req, res) => {
  try {
    const { nombre, descripcion, precio, id_categoria, imagen_url } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'El nombre del platillo es obligatorio.' });
    }

    if (precio === undefined || precio === null || isNaN(precio) || parseFloat(precio) < 0) {
      return res.status(400).json({ message: 'El precio debe ser un número válido mayor o igual a 0.' });
    }

    const nuevoPlatillo = await Producto.create({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : '',
      precio: parseFloat(precio),
      id_categoria: id_categoria ? parseInt(id_categoria, 10) : 1,
      imagen_url: imagen_url ? imagen_url.trim() : ''
    });

    res.status(201).json({ message: 'Platillo agregado exitosamente', platillo: nuevoPlatillo });
  } catch (error) {
    console.error('Error al crear platillo:', error);
    res.status(500).json({ message: 'Error al guardar el nuevo platillo.' });
  }
};

const actualizarPlatillo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, id_categoria, imagen_url } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID de platillo requerido.' });
    }

    const actualizado = await Producto.update(id, {
      nombre,
      descripcion,
      precio,
      id_categoria,
      imagen_url
    });

    if (!actualizado) {
      return res.status(404).json({ message: 'Platillo no encontrado.' });
    }

    res.json({ message: 'Platillo actualizado exitosamente', platillo: actualizado });
  } catch (error) {
    console.error('Error al actualizar platillo:', error);
    res.status(500).json({ message: 'Error al actualizar el platillo.' });
  }
};

const eliminarPlatillo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'ID de platillo requerido.' });
    }

    const eliminado = await Producto.delete(id);
    if (!eliminado) {
      return res.status(404).json({ message: 'Platillo no encontrado o ya eliminado.' });
    }

    res.json({ message: 'Platillo eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar platillo:', error);
    res.status(500).json({ message: 'Error al eliminar el platillo.' });
  }
};

module.exports = {
  getPlatillos,
  crearPlatillo,
  actualizarPlatillo,
  eliminarPlatillo
};
