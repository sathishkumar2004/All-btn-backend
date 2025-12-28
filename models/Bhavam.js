const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const Bhavam = sequelize.define('Bhavam', {
  bhavam: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
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
  hooks: {
    beforeDestroy: async (bhavam, options) => {
      throw new Error('Bhavam records cannot be deleted');
    },
    beforeUpdate: async (bhavam, options) => {
      const changedFields = Object.keys(bhavam._changed);
      const allowedFields = ['dic', 'updated_at']; // underscored field name
      
      const disallowedChanges = changedFields.filter(field => 
        !allowedFields.includes(field)
      );
      
      if (disallowedChanges.length > 0) {
        throw new Error(`Cannot update Bhavam fields: ${disallowedChanges.join(', ')}. Only dic can be modified.`);
      }
    }
  }
});

module.exports = Bhavam;