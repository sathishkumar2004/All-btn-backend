const express = require("express");
const router = express.Router();
const planetCombinationController = require("../controller/PlanetCombinationController");

router.get("/", planetCombinationController.getAllPlanetCombinations);
router.get("/:id", planetCombinationController.getPlanetCombinationById);
router.post("/:id/dic", planetCombinationController.addDicItem);
router.put("/:id/dic/:index", planetCombinationController.updateDicItem);
router.delete("/:id/dic/:index", planetCombinationController.deleteDicItem);
router.get("/:id/dic/search", planetCombinationController.searchDicItems);

module.exports = router;