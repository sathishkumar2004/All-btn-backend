const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const Rasi = sequelize.define('Rasi', {
  rasi: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Add unique constraint
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
  hooks: {
    beforeDestroy: async (rasi, options) => {
      throw new Error('Rasi records cannot be deleted');
    },
    beforeUpdate: async (rasi, options) => {
      const changedFields = Object.keys(rasi._changed);
      const allowedFields = ['dic', 'updated_at'];
      
      const disallowedChanges = changedFields.filter(field => 
        !allowedFields.includes(field)
      );
      
      if (disallowedChanges.length > 0) {
        throw new Error(`Cannot update Rasi fields: ${disallowedChanges.join(', ')}. Only dic can be modified.`);
      }
    }
  }
});

module.exports = Rasi;