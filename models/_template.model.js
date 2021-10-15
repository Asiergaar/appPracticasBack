const { DataTypes } = require('sequelize');
const db = require('../database');

const Names = db.define('Names', {
  // Model attributes
  name_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  attribute: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Other model options go here
});

module.exports = Names;