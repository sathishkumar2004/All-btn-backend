const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const Natchathiram = sequelize.define('Natchathiram', {
  natchathiram: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dic: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
}, {
  tableName: 'natchathiram',
  timestamps: true,
  underscored: true,
});

module.exports = Natchathiram;