const { DataTypes } = require('sequelize');
const db = require('../database');

const Progresses = db.define('Progresses', {
  // Model attributes
  progress_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  progress_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  progress_percentage: {
    type: DataTypes.DOUBLE,
    allowNull: false
  }
}, {
  // Other model options go here
});

module.exports = Progresses;