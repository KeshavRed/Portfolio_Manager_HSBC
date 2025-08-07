const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/add-new-asset', async (req, res) => {
  try {
    const { asset_type, name, quantity, price_at_transaction, transaction_date } = req.body;
    
    let asset_id;
    
    // Add new asset to respective table
    if (asset_type === 'stock') {
      const [result] = await db.query('INSERT INTO stocks (name) VALUES (?)', [name]);
      asset_id = result.insertId;
      
      // Generate some price history for the new stock
      await db.query(`
        INSERT INTO stock_prices (stock_id, price_date, price)
        VALUES (?, ?, ?)
      `, [asset_id, transaction_date, price_at_transaction]);
      
    } else if (asset_type === 'mutual_fund') {
      const [result] = await db.query('INSERT INTO mutual_funds (name) VALUES (?)', [name]);
      asset_id = result.insertId;
      
      // Generate some NAV history for the new mutual fund
      await db.query(`
        INSERT INTO mutual_fund_navs (fund_id, nav_date, nav)
        VALUES (?, ?, ?)
      `, [asset_id, transaction_date, price_at_transaction]);
    }
    
    // Add initial transaction
    await db.query(`
      INSERT INTO transactions (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price, user_id)
      VALUES (?, ?, 'buy', ?, ?, ?, ?, 1)
    `, [asset_type, asset_id, quantity, price_at_transaction, transaction_date, price_at_transaction]);
    
    res.json({ message: 'New asset added successfully', asset_id });
  } catch (error) {
    console.error('Error adding new asset:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;