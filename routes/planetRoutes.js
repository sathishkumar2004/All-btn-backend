const express = require("express");
const router = express.Router();
const planetController = require("../controller/PlanetController");

router.get("/", planetController.getAllPlanets);
router.get("/:id", planetController.getOnePlanet);
router.post("/:id/dic", planetController.addDicItem);
router.put("/:id/dic/:index", planetController.updateDicItem);
router.delete("/:id/dic/:index", planetController.deleteDicItem);
router.get("/:id/dic/search", planetController.searchDicItems);

module.exports = router;