const express = require("express");
const router = express.Router();
const planetController = require("../controller/PlanetCombinationController");

// Bulk insert
router.post("/bulk", planetController.bulkCreateCombination);

// Get all
router.get("/", planetController.getAllCombination);

// Get single
router.get("/:id", planetController.getOneCombination);

// Update entire dic[]
router.put("/:id/dic", planetController.updateCombinationDic);

// Add a dic item
router.post("/:id/dic/add", planetController.addDicItem);

// Update a dic item by index
router.put("/:id/dic/update", planetController.updateDicItem);

// Delete a dic item by index
router.delete("/:id/dic/delete", planetController.deleteDicItem);

module.exports = router;
