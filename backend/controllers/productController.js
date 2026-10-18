const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function stripHtml(html) {
  if (!html) return null;
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || null;
}

function takeFirst(value) {
  if (!value) return null;
  return String(value).split(',')[0].trim() || null;
}

function buildNombre(nombre, quantity) {
  if (!nombre) return null;
  if (quantity && !nombre.toLowerCase().includes(quantity.toLowerCase())) {
    return `${nombre} - ${quantity}`;
  }
  return nombre;
}

// ─── Fase 1: Open Food Facts ────────────────────────────────────────────────
async function lookupOpenFoodFacts(codigo) {
  // Intentar v2 primero (campos específicos, más rápido)
  try {
    const res = await fetchWithTimeout(
      `https://world.openfoodfacts.org/api/v2/product/${codigo}.json?fields=product_name_es,product_name,brands,generic_name_es,generic_name,categories,quantity,image_front_url,image_url`,
      { headers: { 'User-Agent': USER_AGENT } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nombreRaw = p.product_name_es || p.product_name || null;
        const marca = takeFirst(p.brands);
        const nombre = buildNombre(nombreRaw, p.quantity);
        const descripcion = p.generic_name_es || p.generic_name || p.categories || null;
        if (nombre || marca) {
          return {
            origen: 'Open Food Facts',
            nombre,
            marca_nombre: marca,
            descripcion,
            imagen_url: p.image_front_url || p.image_url || null,
          };
        }
      }
    }
  } catch { /* continuar con v1 */ }

  // Fallback a v1 (devuelve más campos en algunos productos)
  try {
    const res = await fetchWithTimeout(
      `https://world.openfoodfacts.org/api/v1/product/${codigo}.json`,
      { headers: { 'User-Agent': USER_AGENT } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const nombreRaw = p.product_name || null;
    const marca = takeFirst(p.brands);
    const nombre = buildNombre(nombreRaw, p.quantity);
    return {
      origen: 'Open Food Facts',
      nombre,
      marca_nombre: marca,
      descripcion: p.generic_name || p.categories || null,
      imagen_url: p.image_front_url || p.image_url || null,
    };
  } catch {
    return null;
  }
}

// ─── Fase 2: Supermercados VTEX Argentina (CORREGIDO) ───────────────────────
async function lookupVtexStore(nombreTienda, baseUrl, codigo) {
  try {
    const url = `${baseUrl}/api/catalog_system/pub/products/search?fq=ean:${codigo}`;
    const res = await fetchWithTimeout(
      url,
      { headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.length) return null;

    const prod = data[0];
    const item = prod.items?.[0];

    const quantity = item?.name || null;
    const nombreRaw = prod.productName || null;
    const nombre = buildNombre(nombreRaw, quantity);

    let descripcion = stripHtml(prod.description);
    if (!descripcion && prod.categories && prod.categories.length > 0) {
      descripcion = prod.categories[0].replace(/\//g, ' ').trim();
    }

    return {
      origen: nombreTienda,
      nombre,
      marca_nombre: prod.brand || null,
      descripcion: descripcion || null,
      imagen_url: item?.images?.[0]?.imageUrl || null,
    };
  } catch (error) {
    console.error(`Error en tienda VTEX ${nombreTienda}:`, error.message);
    return null;
  }
}

// ─── Endpoint principal: escaneo externo ────────────────────────────────────
exports.lookupExternal = async (req, res) => {
  try {
    const { codigo } = req.params;

    // Fase 1: Open Food Facts
    const off = await lookupOpenFoodFacts(codigo);

    // Fase 2: Supermercados VTEX Argentina
    const tiendas = [
      { nombre: 'Carrefour', url: 'https://carrefour.com.ar' },
      { nombre: 'Supermercados Día', url: 'https://supermercadosdia.com.ar' },
    ];
    let vtex = null;
    for (const tienda of tiendas) {
      vtex = await lookupVtexStore(tienda.nombre, tienda.url, codigo);
      if (vtex && vtex.nombre) break;
    }

    // Si ninguna fuente encontró nada
    const offValid = off && (off.nombre || off.marca_nombre);
    const vtexValid = vtex && vtex.nombre;
    if (!offValid && !vtexValid) {
      return res.json({ success: false });
    }

    // Mergear: OFF como primario para nombre/marca, VTEX completa campos vacíos
    const primary = offValid ? off : vtex;
    const secondary = primary === off ? vtex : off;

    // Imagen: preferir VTEX (fotos de catálogo) sobre OFF (fotos comunitarias con manos/fondos raros)
    let imagen_url = null;
    if (vtexValid && vtex.imagen_url) {
      imagen_url = vtex.imagen_url;
    } else if (offValid && off.imagen_url) {
      imagen_url = off.imagen_url;
    } else if (secondary && secondary.imagen_url) {
      imagen_url = secondary.imagen_url;
    }

    const data = {
      origen: primary.origen,
      nombre: primary.nombre || (secondary && secondary.nombre) || null,
      marca_nombre: primary.marca_nombre || (secondary && secondary.marca_nombre) || null,
      descripcion: primary.descripcion || (secondary && secondary.descripcion) || null,
      imagen_url,
    };

    // Origen combinado si se usaron ambas fuentes
    if (secondary && primary !== secondary) {
      data.origen = `${primary.origen} + ${secondary.origen}`;
    }

    return res.json({ success: true, data, source: data.origen });
  } catch (error) {
    console.error('Lookup external error:', error);
    res.json({ success: false });
  }
};

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
    const { codigo_barras, nombre, descripcion, imagen_url, precio_costo, precio_venta, stock_actual, stock_minimo, rubro_id, marca_id } = req.body;

    if (!codigo_barras || !nombre || !rubro_id || !marca_id) {
      return res.status(400).json({ error: 'Código de barras, nombre, rubro y marca son obligatorios' });
    }

    const product = await Product.create({
      codigo_barras, nombre, descripcion, imagen_url, precio_costo, precio_venta, stock_actual, stock_minimo, rubro_id, marca_id,
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
