const { Model, Sequelize } = require('sequelize');
const sequelize  = require('../util/database');
const User = require('./User');
const Application = require('./Application');


class Reminder extends Model {}

Reminder.init({
    applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Applications',
            key: 'id',
        },
        onDelete: 'CASCADE'
    },
    reminderDate: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
    },
    isNotified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'Reminder',
});

Reminder.belongsTo(User, { foreignKey: 'userId' });
Reminder.belongsTo(Application,
    { foreignKey: 'applicationId' });

module.exports = Reminder;