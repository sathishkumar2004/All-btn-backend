const { sequelize } = require("../config/db.js");

// Import ALL models
const User = require("./userDetials");
const RasiTable = require("./rasiTable");
const Rasi = require("./Rasi");
const Natchathiram = require("./Natchathiram");
const Bhavam = require("./Bhavam");
const PlanetCombination = require("./PlanetCombination");
const Planet = require('./Planet.js')

// Define relationships
User.hasMany(RasiTable, { foreignKey: "user_id" });
RasiTable.belongsTo(User, { foreignKey: "user_id" });

// Export ALL models
module.exports = {
  sequelize,
  User,
  RasiTable,
  Rasi,
  Natchathiram,
  Bhavam,
  PlanetCombination,
  Planet,
};