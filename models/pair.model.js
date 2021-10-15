const { DataTypes } = require('sequelize');
const db = require('../database');
const Tokens = require('./token.model');
const Exchanges = require('./exchange.model');

const Pairs = db.define('Pairs', {
  // Model attributes
  pair_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  tokenA: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Tokens,
      key: 'token_id'
    }
  },
  tokenB: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Tokens,
      key: 'token_id'
    }
  },
  pair_exchange: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Exchanges,
      key: 'exchange_id'
    }
  }
}, {
  // Other model options go here
});

module.exports = Pairs;