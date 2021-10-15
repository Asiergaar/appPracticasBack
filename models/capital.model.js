const { DataTypes } = require('sequelize');
const db = require('../database');
const Clients = require('./client.model');
const Progress = require('./progress.model');


const Capitals = db.define('Capitals', {
  // Model attributes
  capital_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  capital_client: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Clients,
      key: 'client_id'
    }
  },
  capital_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  capital_quantity: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  capital_progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Progress,
      key: 'progress_id'
    }
  }
}, {
  // Other model options go here
});

module.exports = Capitals;