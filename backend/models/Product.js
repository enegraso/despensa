const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');
const Brand = require('./Brand');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codigo_barras: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precio_costo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  precio_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  stock_actual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rubro_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id',
    },
  },
  marca_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Brand,
      key: 'id',
    },
  },
}, {
  tableName: 'products',
  timestamps: true,
});

Product.belongsTo(Category, { foreignKey: 'rubro_id', as: 'rubro' });
Product.belongsTo(Brand, { foreignKey: 'marca_id', as: 'marca' });
Category.hasMany(Product, { foreignKey: 'rubro_id', as: 'productos' });
Brand.hasMany(Product, { foreignKey: 'marca_id', as: 'productos' });

module.exports = Product;
