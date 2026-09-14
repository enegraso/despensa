const { Op } = require('sequelize');
const sequelize = require('../config/database');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Brand = require('../models/Brand');

exports.consumptionReport = async (req, res) => {
  try {
    const { desde, hasta, search } = req.query;
    console.log('[REPORT] Consumption params:', { desde, hasta, search });

    const where = { tipo: 'salida_consumo' };

    if (desde || hasta) {
      where.fecha = {};
      if (desde) {
        const startDate = new Date(desde);
        startDate.setHours(0, 0, 0, 0);
        where.fecha[Op.gte] = startDate;
      }
      if (hasta) {
        const endDate = new Date(hasta);
        endDate.setHours(23, 59, 59, 999);
        where.fecha[Op.lte] = endDate;
      }
    }

    console.log('[REPORT] Movement where:', JSON.stringify(where));

    let movements;
    if (search) {
      movements = await StockMovement.findAll({
        where,
        include: [
          {
            model: Product,
            as: 'articulo',
            attributes: ['id', 'nombre', 'precio_venta'],
            where: { nombre: { [Op.iLike]: `%${search}%` } },
            required: true,
          },
        ],
        order: [['fecha', 'DESC']],
      });
    } else {
      movements = await StockMovement.findAll({
        where,
        include: [
          {
            model: Product,
            as: 'articulo',
            attributes: ['id', 'nombre', 'precio_venta'],
          },
        ],
        order: [['fecha', 'DESC']],
      });
    }

    console.log('[REPORT] Movements found:', movements.length);

    let totalRecaudado = 0;
    const items = movements.map((m) => {
      const precio = parseFloat(m.articulo.precio_venta) || 0;
      const subtotal = precio * m.cantidad;
      totalRecaudado += subtotal;
      return {
        id: m.id,
        fecha: m.fecha,
        articulo: m.articulo.nombre,
        cantidad: m.cantidad,
        precio_venta: precio,
        subtotal: Math.round(subtotal * 100) / 100,
      };
    });

    totalRecaudado = Math.round(totalRecaudado * 100) / 100;
    console.log('[REPORT] Total recaudado:', totalRecaudado);

    res.json({ items, totalRecaudado });
  } catch (error) {
    console.error('[REPORT] Consumption error:', error.message, error.stack);
    res.status(500).json({ error: 'Error al generar informe de consumos', detail: error.message });
  }
};

exports.purchasesReport = async (req, res) => {
  try {
    const { desde, hasta, search } = req.query;
    console.log('[REPORT] Purchases params:', { desde, hasta, search });

    const where = { tipo: 'entrada' };

    if (desde || hasta) {
      where.fecha = {};
      if (desde) {
        const startDate = new Date(desde);
        startDate.setHours(0, 0, 0, 0);
        where.fecha[Op.gte] = startDate;
      }
      if (hasta) {
        const endDate = new Date(hasta);
        endDate.setHours(23, 59, 59, 999);
        where.fecha[Op.lte] = endDate;
      }
    }

    let movements;
    if (search) {
      movements = await StockMovement.findAll({
        where,
        include: [
          {
            model: Product,
            as: 'articulo',
            attributes: ['id', 'nombre', 'precio_costo'],
            where: { nombre: { [Op.iLike]: `%${search}%` } },
            required: true,
          },
        ],
        order: [['fecha', 'DESC']],
      });
    } else {
      movements = await StockMovement.findAll({
        where,
        include: [
          {
            model: Product,
            as: 'articulo',
            attributes: ['id', 'nombre', 'precio_costo'],
          },
        ],
        order: [['fecha', 'DESC']],
      });
    }

    console.log('[REPORT] Purchases found:', movements.length);

    let totalInvertido = 0;
    const items = movements.map((m) => {
      const precio = parseFloat(m.articulo.precio_costo) || 0;
      const subtotal = precio * m.cantidad;
      totalInvertido += subtotal;
      return {
        id: m.id,
        fecha: m.fecha,
        articulo: m.articulo.nombre,
        cantidad: m.cantidad,
        precio_costo: precio,
        subtotal: Math.round(subtotal * 100) / 100,
      };
    });

    totalInvertido = Math.round(totalInvertido * 100) / 100;
    console.log('[REPORT] Total invertido:', totalInvertido);

    res.json({ items, totalInvertido });
  } catch (error) {
    console.error('[REPORT] Purchases error:', error.message, error.stack);
    res.status(500).json({ error: 'Error al generar informe de ingresos', detail: error.message });
  }
};

exports.replenishmentList = async (req, res) => {
  try {
    const { search } = req.query;
    console.log('[REPORT] Replenishment list params:', { search });

    const where = {
      [Op.and]: [
        sequelize.where(
          sequelize.col('stock_actual'),
          { [Op.lte]: sequelize.col('stock_minimo') }
        ),
      ],
    };

    if (search) {
      where[Op.and].push({
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { codigo_barras: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    const products = await Product.findAll({
      where,
      attributes: ['id', 'codigo_barras', 'nombre', 'stock_actual', 'stock_minimo'],
      include: [
        { model: Brand, as: 'marca', attributes: ['nombre'] },
      ],
      order: [['nombre', 'ASC']],
    });

    console.log('[REPORT] Low stock products found:', products.length);

    const items = products.map((p) => ({
      id: p.id,
      codigo_barras: p.codigo_barras,
      nombre: p.nombre,
      marca: p.marca?.nombre || '-',
      stock_actual: p.stock_actual,
      stock_minimo: p.stock_minimo,
    }));

    res.json({ items });
  } catch (error) {
    console.error('[REPORT] Replenishment list error:', error.message, error.stack);
    res.status(500).json({ error: 'Error al generar listado de reposición', detail: error.message });
  }
};

exports.priceList = async (req, res) => {
  try {
    const { search } = req.query;
    console.log('[REPORT] Price list params:', { search });

    const where = {};
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { codigo_barras: { [Op.iLike]: `%${search}%` } },
      ];
    }

    console.log('[REPORT] Product where:', JSON.stringify(where));

    const products = await Product.findAll({
      where,
      attributes: ['id', 'codigo_barras', 'nombre', 'precio_venta'],
      include: [
        { model: Brand, as: 'marca', attributes: ['nombre'] },
      ],
      order: [['nombre', 'ASC']],
    });

    console.log('[REPORT] Products found:', products.length);

    const items = products.map((p) => ({
      id: p.id,
      codigo_barras: p.codigo_barras,
      nombre: p.nombre,
      marca: p.marca?.nombre || '-',
      precio_venta: parseFloat(p.precio_venta) || 0,
    }));

    res.json({ items });
  } catch (error) {
    console.error('[REPORT] Price list error:', error.message, error.stack);
    res.status(500).json({ error: 'Error al generar listado de precios', detail: error.message });
  }
};
