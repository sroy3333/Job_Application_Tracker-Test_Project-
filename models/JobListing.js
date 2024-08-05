const { Model, Sequelize } = require('sequelize');
const sequelize = require('../util/database');
const Company = require('./Company');

class JobListing extends Model {}

JobListing.init({
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  companyId: {
    type: Sequelize.INTEGER,
    references: {
      model: Company,
      key: 'id'
    },
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'JobListing'
});

JobListing.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(JobListing, { foreignKey: 'companyId' });

module.exports = JobListing;