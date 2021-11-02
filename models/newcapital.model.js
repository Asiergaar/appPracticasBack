const { DataTypes } = require('sequelize');
const db = require('../database');
const Clients = require('./client.model');

const Newcapitals = db.define('Newcapitals', {
  // Model attributes
  newcapital_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  newcapital_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  newcapital_quantity: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  newcapital_client: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Clients,
      key: 'client_id'
    }
  }
}, {
  // Other model options go here
});

module.exports = Newcapitals;