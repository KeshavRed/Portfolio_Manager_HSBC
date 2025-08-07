const goldModel = require('../models/goldModel');

const getGoldPriceHistory = async (req, res) => {
  try {
    const data = await goldModel.getGoldPrices();
    res.json(data);
  } catch (err) {
    console.error('Error fetching gold prices:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const db = require('../config/db');

// === 1. BUY GOLD ===
const buyGold = async (req, res) => {
  const { quantity } = req.body;
  const transaction_date = new Date().toISOString().split('T')[0]; // Use current date
  console.log('Buy gold request:', { quantity, transaction_date });

  try {
    const [[currentPriceRow]] = await db.query(
      'SELECT price_per_gram FROM gold_prices ORDER BY price_date DESC LIMIT 1'
    );

    console.log('Price data:', { currentPriceRow });

    if (!currentPriceRow) {
      return res.status(404).json({ message: 'Gold price not found' });
    }

    const buyPrice = currentPriceRow.price_per_gram;
    const currentPrice = currentPriceRow.price_per_gram;
    const totalCost = quantity * buyPrice;

    console.log('Transaction details:', { buyPrice, currentPrice, totalCost, userBalance: global.userbalance });

    if (global.userbalance < totalCost) {
      return res.status(400).json({ message: 'Insufficient balance', currentBalance: global.userbalance });
    }

    global.userbalance -= totalCost;

    const result = await db.query(
      `INSERT INTO transactions 
        (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price, user_id)
       VALUES ('gold', 1, 'buy', ?, ?, ?, ?, 1)`,
      [quantity, buyPrice, transaction_date, currentPrice]
    );

    console.log('Insert result:', result);

    res.status(201).json({ message: 'Gold bought', cost: totalCost, newBalance: global.userbalance });
  } catch (error) {
    console.error('Gold buy error:', error);
    res.status(500).json({ error: error.message });
  }
};

// === 2. SELL GOLD ===
const sellGold = async (req, res) => {
  const { quantity } = req.body;
  const transaction_date = new Date().toISOString().split('T')[0]; // Use current date

  try {
    const [[currentPriceRow]] = await db.query(
      'SELECT price_per_gram FROM gold_prices ORDER BY price_date DESC LIMIT 1'
    );

    if (!currentPriceRow) {
      return res.status(404).json({ message: 'Gold price not found' });
    }

    const sellPrice = currentPriceRow.price_per_gram;
    const currentPrice = currentPriceRow.price_per_gram;
    const totalGain = quantity * sellPrice;

    const [[row]] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN transaction_type = 'buy' THEN quantity
          WHEN transaction_type = 'sell' THEN -quantity
        END), 0) AS available_quantity
      FROM transactions WHERE asset_type = 'gold'
    `);

    if (row.available_quantity < quantity) {
      return res.status(400).json({ message: 'Not enough gold to sell', owned: row.available_quantity });
    }

    global.userbalance += totalGain;

    await db.query(
      `INSERT INTO transactions 
        (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price, user_id)
       VALUES ('gold', 1, 'sell', ?, ?, ?, ?, 1)`,
      [quantity, sellPrice, transaction_date, currentPrice]
    );

    res.status(201).json({ message: 'Gold sold', gained: totalGain, newBalance: global.userbalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === 3. GET GOLD PORTFOLIO ===
const getGoldHoldings = async (req, res) => {
  try {
    const [[currentPriceRow]] = await db.query(
      'SELECT price_per_gram FROM gold_prices ORDER BY price_date DESC LIMIT 1'
    );

    if (!currentPriceRow) {
      return res.status(404).json({ message: 'Current gold price not found' });
    }

    const currentPrice = currentPriceRow.price_per_gram;

    const [[portfolio]] = await db.query(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE -quantity END) AS available_quantity,
        SUM(CASE 
              WHEN transaction_type = 'buy' THEN quantity * price_at_transaction
              WHEN transaction_type = 'sell' THEN -quantity * price_at_transaction
            END) AS net_investment
      FROM transactions WHERE asset_type = 'gold'
    `);

    if (!portfolio || portfolio.available_quantity <= 0) {
      return res.status(200).json({ message: 'No gold holdings' });
    }

    const currentValue = portfolio.available_quantity * currentPrice;
    const profitLoss = currentValue - portfolio.net_investment;

    res.status(200).json({
      asset: 'Gold',
      available_quantity: portfolio.available_quantity,
      net_investment: portfolio.net_investment,
      current_price: currentPrice,
      current_value: currentValue.toFixed(2),
      profit_loss: profitLoss.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGoldPriceHistory,
  buyGold,
  sellGold,
  getGoldHoldings
 };