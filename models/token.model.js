const { DataTypes } = require('sequelize');
const db = require('../database');

const Tokens = db.define('Tokens', {
  // Model attributes
  token_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  token_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ticker: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token_img_url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Other model options go here
});

module.exports = Tokens;