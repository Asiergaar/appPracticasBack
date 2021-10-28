const { DataTypes } = require('sequelize');
const db = require('../database');

const Exchanges = db.define('Exchanges', {
  // Model attributes
  exchange_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  exchange_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  URL: {
    type: DataTypes.STRING,
    allowNull: true
  },
  exchange_img_url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Other model options go here
});

module.exports = Exchanges;