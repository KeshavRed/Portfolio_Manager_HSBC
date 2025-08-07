const express = require('express');
const router = express.Router();
const mutualFundController = require('../controllers/mfController');

router.get('/mfs', mutualFundController.getAllMutualFundData);
router.get('/mutual-funds', mutualFundController.getAllMutualFunds); // for dropdown
router.get('/mfs/:id', mutualFundController.getSingleMutualFund);
router.post('/buyMutualFund', mutualFundController.buyMutualFund);
router.post('/sellMutualFund', mutualFundController.sellMutualFund);

module.exports = router;
