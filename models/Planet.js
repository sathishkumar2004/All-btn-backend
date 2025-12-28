const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const Natchathiram = sequelize.define('Natchathiram', {
  natchathiram: {
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
  tableName: 'natchathiram',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeDestroy: async (natchathiram, options) => {
      throw new Error('Natchathiram records cannot be deleted');
    },
    beforeUpdate: async (natchathiram, options) => {
      const changedFields = Object.keys(natchathiram._changed);
      const allowedFields = ['dic', 'updated_at'];
      
      const disallowedChanges = changedFields.filter(field => 
        !allowedFields.includes(field)
      );
      
      if (disallowedChanges.length > 0) {
        throw new Error(`Cannot update Natchathiram fields: ${disallowedChanges.join(', ')}. Only dic can be modified.`);
      }
    }
  }
});

module.exports = Natchathiram;