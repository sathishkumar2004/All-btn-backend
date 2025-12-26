const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const Rasi = sequelize.define('Rasi', {
  rasi: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dic: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
}, {
  tableName: 'rasi',
  timestamps: true,
  underscored: true,
});

module.exports = Rasi;