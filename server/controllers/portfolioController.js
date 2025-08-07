const db = require('../config/db');

// 1. BUY STOCK
exports.buyStock = async (req, res) => {
  const { asset_id, quantity } = req.body;
  const transaction_date = new Date().toISOString().split('T')[0]; // Use current date

  try {
    // Get buy price for transaction date or latest available
    let [[buyPriceRow]] = await db.query(
      'SELECT price FROM stock_prices WHERE stock_id = ? AND price_date = ?',
      [asset_id, transaction_date]
    );
    
    if (!buyPriceRow) {
      [[buyPriceRow]] = await db.query(
        'SELECT price FROM stock_prices WHERE stock_id = ? ORDER BY price_date DESC LIMIT 1',
        [asset_id]
      );
    }

    // Get current price or use buy price as fallback
    let [[currentPriceRow]] = await db.query(
      'SELECT price FROM stock_prices WHERE stock_id = ? ORDER BY price_date DESC LIMIT 1',
      [asset_id]
    );
    
    if (!currentPriceRow) {
      currentPriceRow = buyPriceRow;
    }

    if (!buyPriceRow) {
      return res.status(404).json({ message: 'Stock price not found' });
    }

    const buyPrice = buyPriceRow.price;
    const currentPrice = currentPriceRow.price;
    const totalCost = quantity * buyPrice;

    // Check balance
    if (global.userbalance < totalCost) {
      return res.status(400).json({ message: 'Insufficient balance', currentBalance: global.userbalance });
    }

    // Deduct balance
    global.userbalance -= totalCost;

    // Insert transaction
    await db.query(
      `INSERT INTO transactions 
        (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price, user_id)
       VALUES ('stock', ?, 'buy', ?, ?, ?, ?, 1)`,
      [asset_id, quantity, buyPrice, transaction_date, currentPrice]
    );

    res.status(201).json({ message: 'Stock bought', cost: totalCost, newBalance: global.userbalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. SELL STOCK
exports.sellStock = async (req, res) => {
  const { asset_id, quantity } = req.body;
  const transaction_date = new Date().toISOString().split('T')[0]; // Use current date

  try {
    // Get sell price for transaction date or latest available
    let [[sellPriceRow]] = await db.query(
      'SELECT price FROM stock_prices WHERE stock_id = ? AND price_date = ?',
      [asset_id, transaction_date]
    );
    
    if (!sellPriceRow) {
      [[sellPriceRow]] = await db.query(
        'SELECT price FROM stock_prices WHERE stock_id = ? ORDER BY price_date DESC LIMIT 1',
        [asset_id]
      );
    }

    // Get current price or use sell price as fallback
    let [[currentPriceRow]] = await db.query(
      'SELECT price FROM stock_prices WHERE stock_id = ? ORDER BY price_date DESC LIMIT 1',
      [asset_id]
    );
    
    if (!currentPriceRow) {
      currentPriceRow = sellPriceRow;
    }

    if (!sellPriceRow) {
      return res.status(404).json({ message: 'Stock price not found' });
    }

    const sellPrice = sellPriceRow.price;
    const currentPrice = currentPriceRow.price;
    const totalGain = quantity * sellPrice;

    // Check owned quantity
    const [[row]] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN transaction_type = 'buy' THEN quantity
          WHEN transaction_type = 'sell' THEN -quantity
        END), 0) AS available_quantity
      FROM transactions
      WHERE asset_id = ? AND asset_type = 'stock'
    `, [asset_id]);

    if (row.available_quantity < quantity) {
      return res.status(400).json({ message: 'Not enough quantity to sell', owned: row.available_quantity });
    }

    // Add to balance
    global.userbalance += totalGain;

    // Insert transaction
    await db.query(
      `INSERT INTO transactions 
        (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price, user_id)
       VALUES ('stock', ?, 'sell', ?, ?, ?, ?, 1)`,
      [asset_id, quantity, sellPrice, transaction_date, currentPrice]
    );

    res.status(201).json({ message: 'Stock sold', gained: totalGain, newBalance: global.userbalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. GET PORTFOLIO
exports.getPortfolio = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.name AS stock_name,
        t.asset_id,
        SUM(CASE WHEN t.transaction_type = 'buy' THEN t.quantity ELSE -t.quantity END) AS available_quantity,
        SUM(CASE 
              WHEN t.transaction_type = 'buy' THEN t.quantity * t.price_at_transaction
              WHEN t.transaction_type = 'sell' THEN -t.quantity * t.price_at_transaction
              ELSE 0 
            END) AS net_investment,
        COALESCE(sp.price, latest_sp.price) AS current_price,
        (SUM(CASE WHEN t.transaction_type = 'buy' THEN t.quantity ELSE -t.quantity END) * COALESCE(sp.price, latest_sp.price)) - 
        SUM(CASE 
              WHEN t.transaction_type = 'buy' THEN t.quantity * t.price_at_transaction
              WHEN t.transaction_type = 'sell' THEN -t.quantity * t.price_at_transaction
              ELSE 0 
            END) AS profit_loss
      FROM transactions t
      JOIN stocks s ON t.asset_id = s.id
      LEFT JOIN (
          SELECT stock_id, price
          FROM stock_prices
          WHERE price_date = CURDATE()
      ) sp ON sp.stock_id = t.asset_id
      LEFT JOIN (
          SELECT sp1.stock_id, sp1.price
          FROM stock_prices sp1
          INNER JOIN (
              SELECT stock_id, MAX(price_date) as max_date
              FROM stock_prices
              GROUP BY stock_id
          ) sp2 ON sp1.stock_id = sp2.stock_id AND sp1.price_date = sp2.max_date
      ) latest_sp ON latest_sp.stock_id = t.asset_id
      WHERE t.asset_type = 'stock'
      GROUP BY t.asset_id, s.name, sp.price, latest_sp.price
      HAVING available_quantity > 0;
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. GET MUTUAL FUND PORTFOLIO
exports.getMutualFundPortfolio = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        mf.name AS fund_name,
        t.asset_id,
        SUM(CASE WHEN t.transaction_type = 'buy' THEN t.quantity ELSE -t.quantity END) AS available_quantity,
        SUM(CASE 
              WHEN t.transaction_type = 'buy' THEN t.quantity * t.price_at_transaction
              WHEN t.transaction_type = 'sell' THEN -t.quantity * t.price_at_transaction
              ELSE 0 
            END) AS net_investment,
        COALESCE(mfn.nav, latest_mfn.nav) AS current_price,
        (SUM(CASE WHEN t.transaction_type = 'buy' THEN t.quantity ELSE -t.quantity END) * COALESCE(mfn.nav, latest_mfn.nav)) - 
        SUM(CASE 
              WHEN t.transaction_type = 'buy' THEN t.quantity * t.price_at_transaction
              WHEN t.transaction_type = 'sell' THEN -t.quantity * t.price_at_transaction
              ELSE 0 
            END) AS profit_loss
      FROM transactions t
      JOIN mutual_funds mf ON t.asset_id = mf.id
      LEFT JOIN (
          SELECT fund_id, nav
          FROM mutual_fund_navs
          WHERE nav_date = CURDATE()
      ) mfn ON mfn.fund_id = t.asset_id
      LEFT JOIN (
          SELECT mfn1.fund_id, mfn1.nav
          FROM mutual_fund_navs mfn1
          INNER JOIN (
              SELECT fund_id, MAX(nav_date) as max_date
              FROM mutual_fund_navs
              GROUP BY fund_id
          ) mfn2 ON mfn1.fund_id = mfn2.fund_id AND mfn1.nav_date = mfn2.max_date
      ) latest_mfn ON latest_mfn.fund_id = t.asset_id
      WHERE t.asset_type = 'mutual_fund'
      GROUP BY t.asset_id, mf.name, mfn.nav, latest_mfn.nav
      HAVING available_quantity > 0;
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};