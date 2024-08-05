const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Application = require('./Application');


const Attachment = sequelize.define('Attachment', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    fileUrl: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fileName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    applicationId: {
        type: Sequelize.INTEGER,
        references: {
            model: Application,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
}, {
    timestamps: true,
});

Attachment.belongsTo(Application, { foreignKey: 'applicationId' });

module.exports = Attachment;