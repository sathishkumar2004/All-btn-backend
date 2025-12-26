// routes/userRoutes.js
const express = require("express");
const { User , RasiTable } = require("../models/index")

const router = express.Router()
// POST create a new user
router.post("/create", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Basic validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // Create user
    const newUser = await User.create({
      name,
      email,
      phone,
      password, // in production, hash passwords!
    });

    res.status(201).json({
      message: "User created successfully!",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: RasiTable,
        },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User fetched",
      data: user,
    });
  } catch (error) {
    console.error("🔥 GET USER ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;