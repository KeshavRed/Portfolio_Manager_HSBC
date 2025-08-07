const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

router.post('/buy', portfolioController.buyStock);
router.post('/sell', portfolioController.sellStock);
router.get('/', portfolioController.getPortfolio);
router.get('/mutualfunds', portfolioController.getMutualFundPortfolio);
router.get('/transactions', async (req, res) => {
  try {
    const db = require('../config/db');
    console.log('Attempting to fetch transactions...');
    
    // First, let's try a simple count
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM transactions');
    console.log('Total transactions in DB:', countResult[0].count);
    
    // Now get the actual data
    const [rows] = await db.query(`
      SELECT 
        t.*,
        s.name AS asset_name
      FROM transactions t
      LEFT JOIN stocks s ON t.asset_id = s.id
      ORDER BY t.transaction_date DESC
    `);
    console.log('Transactions found:', rows.length);
    console.log('First few transactions:', rows.slice(0, 3));
    res.json(rows);
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.query('SELECT * FROM transactions LIMIT 5');
    res.json({ message: 'Test successful', count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
