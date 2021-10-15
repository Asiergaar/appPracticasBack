const Sequelize = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    host: '127.0.0.1',
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'farming.db')
  });

  module.exports = sequelize;