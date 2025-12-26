const express = require("express");
const router = express.Router();
const rasiController = require("../controller/RasiController");

router.post("/bulk", rasiController.bulkCreateRasi);
router.get("/", rasiController.getAllRasi);
router.get("/:id", rasiController.getRasiById);

// dic routes
router.put("/:id/dic", rasiController.updateRasiDic);
router.post("/:id/dic", rasiController.addDicItem);

// ET SINGLE dic
router.get("/:id/dic/:index", rasiController.getSingleDic);

router.put("/:id/dic/:index", rasiController.updateDicItem);
router.delete("/:id/dic/:index", rasiController.deleteDicItem);

module.exports = router;
