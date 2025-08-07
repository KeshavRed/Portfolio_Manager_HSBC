const express = require('express');
const router = express.Router();
const balance = require('../controllers/balance');

router.get('/fetchBalance', balance.fetchBalance);
router.get('/updateBalance',balance.updateBalance);



module.exports = router;
