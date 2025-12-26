// routes/natchathiramRoutes.js
const express = require("express");
const router = express.Router();
const natchathiramController = require("../controller/NatchathiramController");

router.post("/bulk", natchathiramController.bulkCreateNatchathiram);
router.get("/", natchathiramController.getAllNatchathiram);
router.get("/:id", natchathiramController.getOneNatchathiram);
router.put("/:id/dic", natchathiramController.updateNatchathiramDic);
router.post("/:id/dic", natchathiramController.addDicItem);
router.put("/:id/dic/:index", natchathiramController.updateDicItem);    // UPDATED: index in URL
router.delete("/:id/dic/:index", natchathiramController.deleteDicItem); // UPDATED: index in URL
router.get("/:id/dic/:index", natchathiramController.getSingleDic);     // Optional: get single item

module.exports = router;