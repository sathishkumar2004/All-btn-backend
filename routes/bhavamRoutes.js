const express = require("express");
const router = express.Router();
const bhavamController = require("../controller/BhavamController");

router.get("/", bhavamController.getAllBhavam);
router.get("/:id", bhavamController.getBhavamById);
router.post("/:id/dic", bhavamController.addDicItem);
router.put("/:id/dic/:index", bhavamController.updateDicItem);
router.delete("/:id/dic/:index", bhavamController.deleteDicItem);
router.get("/:id/dic/search", bhavamController.searchDicItems);

module.exports = router;