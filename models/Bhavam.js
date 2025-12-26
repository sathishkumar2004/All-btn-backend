const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const Bhavam = sequelize.define('Bhavam', {
  bhavam: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dic: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
}, {
  tableName: 'bhavam',
  timestamps: true,
  underscored: true,
});

module.exports = Bhavam;