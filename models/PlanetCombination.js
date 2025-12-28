// models/PlanetCombination.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const PlanetCombination = sequelize.define('PlanetCombination', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false, // IMPORTANT: false to allow custom IDs
    allowNull: false,
  },
  combo: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  dic: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  }
}, {
  tableName: 'planet_combinations',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeDestroy: async (planetCombination, options) => {
      throw new Error('Planet Combination records cannot be deleted');
    },
    beforeUpdate: async (planetCombination, options) => {
      const changedFields = Object.keys(planetCombination._changed);
      const allowedFields = ['dic', 'name', 'updated_at'];
      
      const disallowedChanges = changedFields.filter(field => 
        !allowedFields.includes(field)
      );
      
      if (disallowedChanges.length > 0) {
        throw new Error(`Cannot update Planet Combination fields: ${disallowedChanges.join(', ')}. Only dic and name can be modified.`);
      }
    }
  }
});

module.exports = PlanetCombination;