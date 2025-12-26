
const express = require('express');
const router = express.Router();
const filterController = require('../controller/filterController');


router.get('/filter/all', filterController.filterAllData);
router.get('/filter/all-data', filterController.getAllFilteredData);
router.post('/filter/bulk', filterController.bulkFilter);

module.exports = router;