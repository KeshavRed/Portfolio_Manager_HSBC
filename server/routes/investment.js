const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
router.get('/investment-distribution', async (req, res) => {
  try {
    const [stockRows] = await db.execute(`
      SELECT 
        SUM(CASE 
              WHEN transaction_type = 'buy' THEN quantity 
              WHEN transaction_type = 'sell' THEN -quantity 
            END * current_price) AS stock_investment
      FROM transactions
      WHERE asset_type = 'stock'
    `);

    const [goldRows] = await db.execute(`
      SELECT 
        SUM(CASE 
              WHEN transaction_type = 'buy' THEN quantity 
              WHEN transaction_type = 'sell' THEN -quantity 
            END * current_price) AS gold_investment
      FROM transactions
      WHERE asset_type = 'gold'
    `);

    const [mfRows] = await db.execute(`
      SELECT 
        SUM(CASE 
              WHEN transaction_type = 'buy' THEN quantity 
              WHEN transaction_type = 'sell' THEN -quantity 
            END * current_price) AS mf_investment
      FROM transactions
      WHERE asset_type = 'mutual_fund'
    `);

    const stock = stockRows[0].stock_investment || 0;
    const gold = goldRows[0].gold_investment || 0;
    const mf = mfRows[0].mf_investment || 0;

    res.json({
      stocks: stock,
      gold: gold,
      mutualFunds: mf,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching investment data' });
  }
});

module.exports = router;
