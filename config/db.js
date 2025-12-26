const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("astrology_db", "postgres", "1234", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB}; 
