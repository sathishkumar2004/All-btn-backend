const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const PlanetCombination = sequelize.define('PlanetCombination', {
  combo: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  dic: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
}, {
  tableName: 'planet_combinations',
  timestamps: true,
  underscored: true,
});

module.exports = PlanetCombination;