const { Model, Sequelize } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./User');


class Application extends Model {}

Application.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  companyName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  jobTitle: {
    type: Sequelize.STRING,
    allowNull: false
  },
  applicationDate: {
    type: Sequelize.DATE,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('applied', 'interviewed', 'offered', 'rejected'),
    allowNull: false
  },
  notes: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
  },
}, {
  sequelize,
  modelName: 'Application',
  timestamps: true
});

Application.belongsTo(User, { foreignKey: 'userId' });

module.exports = Application;