const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

exports.list = async (req, res) => {
  try {
    const { search, rubro_id, marca_id } = req.query;
    const where = {};

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { codigo_barras: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (rubro_id) where.rubro_id = rubro_id;
    if (marca_id) where.marca_id = marca_id;

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'rubro', attributes: ['id', 'nombre'] },
        { model: Brand, as: 'marca', attributes: ['id', 'nombre'] },
      ],
      order: [['nombre', 'ASC']],
    });
    res.json(products);
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getByBarcode = async (req, res) => {
  try {
    const { codigo_barras } = req.params;
    const product = await Product.findOne({
      where: { codigo_barras },
      include: [
        { model: Category, as: 'rubro', attributes: ['id', 'nombre'] },
        { model: Brand, as: 'marca', attributes: ['id', 'nombre'] },
      ],
    });
    if (!product) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.create = async (req, res) => {
  try {
    const { codigo_barras, nombre, descripcion, precio_costo, precio_venta, stock_actual, stock_minimo, rubro_id, marca_id } = req.body;

    if (!codigo_barras || !nombre || !rubro_id || !marca_id) {
      return res.status(400).json({ error: 'Código de barras, nombre, rubro y marca son obligatorios' });
    }

    const product = await Product.create({
      codigo_barras, nombre, descripcion, precio_costo, precio_venta, stock_actual, stock_minimo, rubro_id, marca_id,
    });

    const full = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'rubro', attributes: ['id', 'nombre'] },
        { model: Brand, as: 'marca', attributes: ['id', 'nombre'] },
      ],
    });

    res.status(201).json(full);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un artículo con ese código de barras' });
    }
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    await product.update(req.body);

    const full = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'rubro', attributes: ['id', 'nombre'] },
        { model: Brand, as: 'marca', attributes: ['id', 'nombre'] },
      ],
    });

    res.json(full);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un artículo con ese código de barras' });
    }
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    await product.destroy();
    res.json({ message: 'Artículo eliminado' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
