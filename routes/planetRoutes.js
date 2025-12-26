const express = require("express");
const router = express.Router();

const planetController = require("../controller/PlanetController");

// IMPORTANT: Use the correct function names from your controller
router.post("/bulk", planetController.bulkCreatePlanets);  // Note: bulkCreatePlanets (plural)
router.get("/", planetController.getAllPlanets);           // Note: getAllPlanets (plural)
router.get("/:id", planetController.getOnePlanet);
router.put("/:id/dic", planetController.updatePlanetDic);
router.post("/:id/dic", planetController.addDicItem);
router.put("/:id/dic/:index", planetController.updateDicItem);    // UPDATED: Now has :index in URL
router.delete("/:id/dic/:index", planetController.deleteDicItem); // UPDATED: Now has :index in URL

module.exports = router;