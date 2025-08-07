const db = require('../config/db');

const getGoldPrices = async () => {
  const [rows] = await db.query(
    `SELECT price_date, price_per_gram
     FROM gold_prices
     ORDER BY price_date ASC`
  );
  return rows;
};

module.exports = { getGoldPrices };