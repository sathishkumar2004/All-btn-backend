const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');

const Planet = sequelize.define('Planet', {
   planet: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    dic: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  }, {
    tableName: 'planet',
    timestamps: true,
    underscored: true,
});

module.exports = Planet;
