const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./User');

const Profile = sequelize.define('Profile', {
  id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
  },
  name: {
      type: Sequelize.STRING,
      allowNull: false
  },
  email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
  },
  contact: {
      type: Sequelize.STRING,
      allowNull: true
  },
  address: {
      type: Sequelize.STRING,
      allowNull: true
  },
  careerGoals: {
      type: Sequelize.TEXT,
      allowNull: true
  },
}, {
  timestamps: true,
});

User.hasOne(Profile, { foreignKey: 'userId' });
Profile.belongsTo(User, { foreignKey: 'userId' });

module.exports = Profile;