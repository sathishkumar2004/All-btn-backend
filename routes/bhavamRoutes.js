const express = require("express");
const router = express.Router();

const bhavamController = require("../controller/BhavamController");

router.post("/bulk", bhavamController.bulkCreateBhavam);
router.get("/", bhavamController.getAllBhavam);
router.get("/:id", bhavamController.getBhavamById);
router.put("/:id/dic", bhavamController.updateBhavamDic);
router.post("/:id/dic", bhavamController.addDicItem);
router.get("/:id/dic/:index", bhavamController.getSingleDic);
router.put("/:id/dic/:index", bhavamController.updateDicItem);
router.delete("/:id/dic/:index", bhavamController.deleteDicItem);
router.get("/:id/dic/search", bhavamController.searchDicItems); // Optional
module.exports = router;