const mutualFundModel = require('../models/mfModel');
const db = require('../config/db');

const getAllMutualFundData = async (req, res) => {
  try {
    const data = await mutualFundModel.getAllMutualFundData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllMutualFunds = async (req, res) => {
  try {
    const data = await mutualFundModel.getAllMutualFunds();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSingleMutualFund = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await mutualFundModel.getMutualFundById(id);

    if (data.length === 0) {
      return res.status(404).json({ error: 'Mutual Fund not found or no NAV data.' });
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching mutual fund:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const buyMutualFund = async (req, res) => {
  const { fund_id, quantity } = req.body;
  const transaction_date = new Date().toISOString().split('T')[0]; // Use current date

  try {
    // Get NAV for transaction date or latest available
    let [[navRow]] = await db.query(
      'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? AND nav_date = ?',
      [fund_id, transaction_date]
    );
    
    if (!navRow) {
      [[navRow]] = await db.query(
        'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? ORDER BY nav_date DESC LIMIT 1',
        [fund_id]
      );
    }

    // Get current NAV or use buy NAV as fallback
    let [[currentNavRow]] = await db.query(
      'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? ORDER BY nav_date DESC LIMIT 1',
      [fund_id]
    );
    
    if (!currentNavRow) {
      currentNavRow = navRow;
    }

    if (!navRow) {
      return res.status(404).json({ message: 'Mutual fund NAV not found' });
    }

    const buyNav = navRow.nav;
    const currentNav = currentNavRow.nav;
    const totalCost = quantity * buyNav;

    if (global.userbalance < totalCost) {
      return res.status(400).json({ message: 'Insufficient balance', currentBalance: global.userbalance });
    }

    global.userbalance -= totalCost;

    await db.query(
      `INSERT INTO transactions 
        (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price, user_id)
       VALUES ('mutual_fund', ?, 'buy', ?, ?, ?, ?, 1)`,
      [fund_id, quantity, buyNav, transaction_date, currentNav]
    );

    res.status(201).json({ message: 'Mutual fund bought', cost: totalCost, newBalance: global.userbalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sellMutualFund = async (req, res) => {
  const { fund_id, quantity } = req.body;
  const transaction_date = new Date().toISOString().split('T')[0]; // Use current date

  try {
    // Get NAV for transaction date or latest available
    let [[navRow]] = await db.query(
      'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? AND nav_date = ?',
      [fund_id, transaction_date]
    );
    
    if (!navRow) {
      [[navRow]] = await db.query(
        'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? ORDER BY nav_date DESC LIMIT 1',
        [fund_id]
      );
    }

    // Get current NAV or use sell NAV as fallback
    let [[currentNavRow]] = await db.query(
      'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? ORDER BY nav_date DESC LIMIT 1',
      [fund_id]
    );
    
    if (!currentNavRow) {
      currentNavRow = navRow;
    }

    if (!navRow) {
      return res.status(404).json({ message: 'Mutual fund NAV not found' });
    }

    const sellNav = navRow.nav;
    const currentNav = currentNavRow.nav;
    const totalGain = quantity * sellNav;

    const [[row]] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN transaction_type = 'buy' THEN quantity
          WHEN transaction_type = 'sell' THEN -quantity
        END), 0) AS available_quantity
      FROM transactions WHERE asset_type = 'mutual_fund' AND asset_id = ?
    `, [fund_id]);

    if (row.available_quantity < quantity) {
      return res.status(400).json({ message: 'Not enough units to sell', owned: row.available_quantity });
    }

    global.userbalance += totalGain;

    await db.query(
      `INSERT INTO transactions 
        (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price, user_id)
       VALUES ('mutual_fund', ?, 'sell', ?, ?, ?, ?, 1)`,
      [fund_id, quantity, sellNav, transaction_date, currentNav]
    );

    res.status(201).json({ message: 'Mutual fund sold', gained: totalGain, newBalance: global.userbalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMutualFundData,
  getAllMutualFunds,
  getSingleMutualFund,
  buyMutualFund,
  sellMutualFund
};
