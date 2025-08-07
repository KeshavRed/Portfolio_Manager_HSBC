const db = require('../config/db');

exports.getTransactions = async (req, res) => {
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
    
    console.log('Fetched transactions:', rows.length);
    console.log('Sample transactions:', rows.slice(0, 3));
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { asset_type, asset_id, transaction_type, quantity, price_at_transaction } = req.body;
    const transaction_date = new Date().toISOString().split('T')[0]; // Use current date
    
    let current_price;
    
    // Get current price based on asset type
    if (asset_type === 'stock') {
      const [stockPrice] = await db.query(
        'SELECT price FROM stock_prices WHERE stock_id = ? ORDER BY price_date DESC LIMIT 1',
        [asset_id]
      );
      current_price = stockPrice[0]?.price || price_at_transaction;
    } else if (asset_type === 'mutual_fund') {
      const [mfPrice] = await db.query(
        'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? ORDER BY nav_date DESC LIMIT 1',
        [asset_id]
      );
      current_price = mfPrice[0]?.nav || price_at_transaction;
    } else if (asset_type === 'gold') {
      const [goldPrice] = await db.query(
        'SELECT price_per_gram FROM gold_prices ORDER BY price_date DESC LIMIT 1'
      );
      current_price = goldPrice[0]?.price_per_gram || price_at_transaction;
    }
    
    await db.query(
      'INSERT INTO transactions (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price, 1]
    );
    
    res.json({ message: 'Transaction added successfully' });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: error.message });
  }
};