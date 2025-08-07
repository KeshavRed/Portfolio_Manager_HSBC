const express = require('express');
const router = express.Router();
const goldController = require('../controllers/goldController');

router.get('/gold', goldController.getGoldPriceHistory);

router.post('/buyGold', goldController.buyGold);
router.post('/sellGold', goldController.sellGold);
router.get('/portfolioGold', goldController.getGoldHoldings);

module.exports = router;