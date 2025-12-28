const express = require("express");
const router = express.Router();
const natchathiramController = require("../controller/NatchathiramController");

router.get("/", natchathiramController.getAllNatchathiram);
router.get("/:id", natchathiramController.getOneNatchathiram);
router.post("/:id/dic", natchathiramController.addDicItem);
router.put("/:id/dic/:index", natchathiramController.updateDicItem);
router.delete("/:id/dic/:index", natchathiramController.deleteDicItem);
router.get("/:id/dic/search", natchathiramController.searchDicItems);

module.exports = router;