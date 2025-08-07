const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/stocks', stockController.getAllStockData); // for line graph
router.get('/stocks-list', stockController.getAllStocks); // for dropdown
router.get('/stocks/:id', stockController.getSingleStock);




module.exports = router;
