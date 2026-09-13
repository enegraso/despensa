const Brand = require('../models/Brand');

exports.list = async (req, res) => {
  try {
    const brands = await Brand.findAll({ order: [['nombre', 'ASC']] });
    res.json(brands);
  } catch (error) {
    console.error('List brands error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const brand = await Brand.create({ nombre });
    res.status(201).json(brand);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe una marca con ese nombre' });
    }
    console.error('Create brand error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    await brand.update({ nombre });
    res.json(brand);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe una marca con ese nombre' });
    }
    console.error('Update brand error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    await brand.destroy();
    res.json({ message: 'Marca eliminada' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
