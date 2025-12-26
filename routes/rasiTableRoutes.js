const express = require("express");
const { RasiTable, User } = require("../models"); 
const router = express.Router();

// POST Rasi
router.post("/", async (req, res) => {
  try {
    const rasiData = req.body;

    if (!Array.isArray(rasiData) || rasiData.length === 0) {
      return res.status(400).json({ error: "Invalid Rasi Data" });
    }

    // Extract user_id safely
    const user_Id = rasiData.find(item => item.user_id)?.user_id;

    if (!user_Id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Duplicate check
    const existing = await RasiTable.findOne({
      where: { user_id: user_Id }   // ✔ Correct field name
    });

    if (existing) {
      return res.status(400).json({
        error: "Rasi Data already exists for this user. Duplicate not allowed"
      });
    }

    // Insert new data
    const inserted = await RasiTable.bulkCreate(rasiData);

    res.status(200).json({
      message: "Rasi data inserted successfully!",
      data: inserted,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});



// GET Rasi
router.get("/", async (req, res) => {
  try {
    const data = await RasiTable.findAll({ include: User });
    res.status(200).json({
      message: "Rasi Table data fetched successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });  
  }
});

module.exports = router;
