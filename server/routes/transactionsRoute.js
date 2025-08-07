const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.id,
        t.asset_type,
        t.asset_id,
        t.transaction_type,
        t.quantity,
        t.price_at_transaction,
        t.transaction_date,
        t.current_price,
        CASE 
          WHEN t.asset_type = 'stock' THEN s.name
          WHEN t.asset_type = 'mutual_fund' THEN mf.name
          WHEN t.asset_type = 'gold' THEN 'Gold'
        END AS asset_name
      FROM transactions t
      LEFT JOIN stocks s ON t.asset_type = 'stock' AND t.asset_id = s.id
      LEFT JOIN mutual_funds mf ON t.asset_type = 'mutual_fund' AND t.asset_id = mf.id
      ORDER BY t.transaction_date DESC, t.id DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/add-new-asset', async (req, res) => {
  try {
    const { asset_type, name, quantity, price_at_transaction } = req.body;
    const transaction_date = new Date().toISOString().split('T')[0]; // Use current date
    
    let asset_id;
    
    if (asset_type === 'stock') {
      const [result] = await db.query('INSERT INTO stocks (name) VALUES (?)', [name]);
      asset_id = result.insertId;
      
      // Add price for current date
      await db.query(`
        INSERT INTO stock_prices (stock_id, price_date, price)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE price = VALUES(price)
      `, [asset_id, transaction_date, price_at_transaction]);
      
    } else if (asset_type === 'mutual_fund') {
      const [result] = await db.query('INSERT INTO mutual_funds (name) VALUES (?)', [name]);
      asset_id = result.insertId;
      
      // Add NAV for current date
      await db.query(`
        INSERT INTO mutual_fund_navs (fund_id, nav_date, nav)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE nav = VALUES(nav)
      `, [asset_id, transaction_date, price_at_transaction]);
    }
    
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

router.post('/', async (req, res) => {
  const { asset_type, asset_id, transaction_type, quantity } = req.body;

  if (!asset_type || !asset_id || !transaction_type || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let priceQuery = '';
  let price = 0;

  try {
    if (asset_type === 'stock') {
      [[{ price }]] = await db.query(
        `SELECT price FROM stock_prices WHERE stock_id = ? ORDER BY price_date DESC LIMIT 1`,
        [asset_id]
      );
    } else if (asset_type === 'mutual_fund') {
      [[{ nav }]] = await db.query(
        `SELECT nav FROM mutual_fund_navs WHERE fund_id = ? ORDER BY nav_date DESC LIMIT 1`,
        [asset_id]
      );
      price = nav;
    } else if (asset_type === 'gold') {
      [[{ price_per_gram }]] = await db.query(
        `SELECT price_per_gram FROM gold_prices ORDER BY price_date DESC LIMIT 1`
      );
      price = price_per_gram;
    }

    await db.query(
      `INSERT INTO transactions (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date)
       VALUES (?, ?, ?, ?, ?, CURDATE())`,
      [asset_type, asset_id, transaction_type, quantity, price]
    );

    res.status(201).json({ message: 'Transaction recorded successfully' });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;