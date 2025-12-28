const express = require("express");
const router = express.Router();
const rasiController = require("../controller/RasiController");

//  SIMPLIFIED TO JUST 6 ESSENTIAL ROUTES:

//  Get ALL Rasi (shows dic items too)
router.get("/", rasiController.getAllRasi);

// Get specific Rasi by ID (includes its dic items)
router.get("/:id", rasiController.getRasiById);

// DIC OPERATIONS:
router.post("/:id/dic", rasiController.addDicItem);          // Add
router.put("/:id/dic/:index", rasiController.updateDicItem); // Update
router.delete("/:id/dic/:index", rasiController.deleteDicItem); // Delete

// SEARCH/BROWSE dic items
router.get("/:id/dic/search", rasiController.searchDicItems);

module.exports = router;