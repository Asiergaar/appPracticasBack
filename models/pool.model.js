const { DataTypes } = require('sequelize');
const db = require('../database');
const Pairs = require('./pair.model');

const Pools = db.define('Pools', {
  // Model attributes
  pool_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  pool_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  invested_quantity: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  pool_pair: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Pairs,
      key: 'pair_id'
    }
  }
}, {
  // Other model options go here
});

module.exports = Pools;