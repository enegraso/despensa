const Category = require('../models/Category');

exports.list = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['nombre', 'ASC']] });
    res.json(categories);
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const category = await Category.create({ nombre });
    res.status(201).json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un rubro con ese nombre' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Rubro no encontrado' });
    }
    await category.update({ nombre });
    res.json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un rubro con ese nombre' });
    }
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Rubro no encontrado' });
    }
    await category.destroy();
    res.json({ message: 'Rubro eliminado' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
