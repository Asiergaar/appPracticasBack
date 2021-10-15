const { DataTypes } = require('sequelize');
const db = require('../database');

const Clients = db.define('Clients', {
  // Model attributes
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  client_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  client_surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entry_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  start_capital: {
    type: DataTypes.DOUBLE,
    allowNull: false
  }
}, {
  // Other model options go here
});

module.exports = Clients;