const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// Section 1 — Dropdown & Filters
const filterRoutes = require("./routes/filterRoutes.js");

// Section 2 — User Horoscope Table
const rasiTableRoutes = require("./routes/rasiTableRoutes.js");

// Section 3 — User Management
const userDetailsRoutes = require("./routes/userDetialsRoutes.js");

// Astrology Master Data
const bhavamRoutes = require("./routes/bhavamRoutes.js");
const natchathiramRoutes = require("./routes/natchathiramRoutes.js");
const planetCombinationRoutes = require("./routes/planetCombinationRoutes.js");
const planetRoutes = require("./routes/planetRoutes.js");
const rasiRoutes = require("./routes/rasiRoutes.js");

// ======================= API ROUTES =========================
app.use("/api", filterRoutes);
app.use("/api/rasi-tables", rasiTableRoutes);
app.use("/api/users", userDetailsRoutes);

app.use("/api/bhavam", bhavamRoutes);
app.use("/api/natchathiram", natchathiramRoutes);
app.use("/api/combinations", planetCombinationRoutes);
app.use("/api/planet", planetRoutes);
app.use("/api/rasi", rasiRoutes);

// ======================= ROOT ENDPOINT ======================
app.get("/", (req, res) => {
  res.json({
    message: "Complete Astrology API System",
    version: "3.0",
    api_sections: {
      dropdown_tables: [
        "/api/rasi",
        "/api/bhavam",
        "/api/natchathiram",
        "/api/combinations"
      ],
      user_horoscope: "/api/rasi-tables",
      user_management: "/api/users",
      examples: {
        positive_rasi: "/api/rasi/1/filtered?filter=pos"
      }
    }
  });
});

// ======================= SERVER START =======================
const { connectDB } = require("./config/db.js");
async function startServer() {
  try {
    await connectDB();
    console.log("⚡ Database Connected Successfully");

    // Load models
    const {
      Rasi,
      Bhavam,
      Natchathiram,
      PlanetCombination,
      User,
      RasiTable,
      Planet,
    } = require("./models/index.js");

    // Sync models
    const models = [
      User,
      RasiTable,
      Rasi,
      Bhavam,
      Natchathiram,
      PlanetCombination,
      Planet,
    ];

    for (const model of models) {
      await model.sync({ alter: true });
      console.log(`✅ Synced: ${model.tableName}`);
    }

    console.log("✨ All table sync completed\n");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📌 API Home → http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
}

startServer();
