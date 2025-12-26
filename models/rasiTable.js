// models/RasiTable.js - பயனர் ஜாதக தரவுகள்
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.js");

const RasiTable = sequelize.define(
  "RasiTable",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    rasi: { type: DataTypes.STRING, allowNull: false },
    lagna: { type: DataTypes.STRING, allowNull: false },
    nakshatra: { type: DataTypes.STRING, allowNull: false },
    hd: { type: DataTypes.STRING, allowNull: false },
    ld: { type: DataTypes.STRING, allowNull: false },
    houses: { type: DataTypes.STRING, allowNull: false },
    bhavam_no: { type: DataTypes.INTEGER, allowNull: false },
    rasi_name: { type: DataTypes.STRING, allowNull: false },
    planet: { type: DataTypes.JSON, allowNull: false },
    degree: { type: DataTypes.STRING, allowNull: false },
    nakshatras: { type: DataTypes.JSON, allowNull: false },
    combinations: { type: DataTypes.JSON, allowNull: false },
  },
  { tableName: "rasi_table", timestamps: true }
);

module.exports = RasiTable;