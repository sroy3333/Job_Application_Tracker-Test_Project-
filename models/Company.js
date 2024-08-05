const { Model, Sequelize } = require('sequelize');
const sequelize = require('../util/database');

class Company extends Model {}

Company.init({
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  contact: {
    type: Sequelize.STRING,
    allowNull: false
  },
  size: {
    type: Sequelize.STRING,
    allowNull: false
  },
  industry: {
    type: Sequelize.STRING,
    allowNull: false
  },
  notes: {
    type: Sequelize.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Company'
});

module.exports = Company;