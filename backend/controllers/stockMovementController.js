const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

exports.lookup = async (req, res) => {
  try {
    const { codigo_barras } = req.params;

    if (!codigo_barras) {
      return res.status(400).json({ error: 'Código de barras es obligatorio' });
    }

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
    console.error('Lookup error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.confirm = async (req, res) => {
  try {
    const { product_id, cantidad } = req.body;
    const usuario_id = req.user.id;
    const qty = parseInt(cantidad) || 1;

    if (!product_id) {
      return res.status(400).json({ error: 'ID de producto es obligatorio' });
    }

    if (qty <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    const product = await Product.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    if (product.stock_actual < qty) {
      return res.status(400).json({
        error: `Stock insuficiente. Disponible: ${product.stock_actual}`,
        product: { id: product.id, nombre: product.nombre, stock_actual: product.stock_actual },
      });
    }

    await Product.update(
      { stock_actual: product.stock_actual - qty },
      { where: { id: product.id } }
    );

    const movement = await StockMovement.create({
      articulo_id: product.id,
      cantidad: qty,
      tipo: 'salida_consumo',
      fecha: new Date(),
      usuario_id,
    });

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'rubro', attributes: ['id', 'nombre'] },
        { model: Brand, as: 'marca', attributes: ['id', 'nombre'] },
      ],
    });

    res.json({
      message: `Consumo registrado: ${qty} unidad(es)`,
      product: updatedProduct,
      movement: { id: movement.id, cantidad: movement.cantidad, tipo: movement.tipo, fecha: movement.fecha },
    });
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.confirmEntry = async (req, res) => {
  try {
    const { product_id, cantidad, precio_costo, precio_venta } = req.body;
    const usuario_id = req.user.id;
    const qty = parseInt(cantidad) || 1;

    if (!product_id) {
      return res.status(400).json({ error: 'ID de producto es obligatorio' });
    }

    if (qty <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    const product = await Product.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    const updateData = { stock_actual: product.stock_actual + qty };

    if (precio_costo !== undefined && precio_costo !== null && precio_costo !== '') {
      updateData.precio_costo = parseFloat(precio_costo);
    }
    if (precio_venta !== undefined && precio_venta !== null && precio_venta !== '') {
      updateData.precio_venta = parseFloat(precio_venta);
    }

    await Product.update(updateData, { where: { id: product.id } });

    const movement = await StockMovement.create({
      articulo_id: product.id,
      cantidad: qty,
      tipo: 'entrada',
      fecha: new Date(),
      usuario_id,
    });

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'rubro', attributes: ['id', 'nombre'] },
        { model: Brand, as: 'marca', attributes: ['id', 'nombre'] },
      ],
    });

    res.json({
      message: `Ingreso registrado: ${qty} unidad(es)`,
      product: updatedProduct,
      movement: { id: movement.id, cantidad: movement.cantidad, tipo: movement.tipo, fecha: movement.fecha },
    });
  } catch (error) {
    console.error('Confirm entry error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.listByProduct = async (req, res) => {
  try {
    const { articulo_id } = req.params;
    const movements = await StockMovement.findAll({
      where: { articulo_id },
      include: [
        { model: Product, as: 'articulo', attributes: ['id', 'nombre', 'codigo_barras'] },
      ],
      order: [['fecha', 'DESC']],
      limit: 50,
    });
    res.json(movements);
  } catch (error) {
    console.error('List movements error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
