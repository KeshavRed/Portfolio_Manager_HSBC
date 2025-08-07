const db = require('../config/db');

const getAllStockData = async () => {
  const [rows] = await db.query(
    `SELECT s.id, s.name AS stock_name, sp.price_date, sp.price 
     FROM stock_prices sp
     JOIN stocks s ON sp.stock_id = s.id
     ORDER BY sp.price_date ASC`
  );
  return rows;
};

const getStockById = async (stockId) => {
  const [rows] = await db.query(
    `SELECT s.name AS stock_name, sp.price_date, sp.price
     FROM stock_prices sp
     JOIN stocks s ON sp.stock_id = s.id
     WHERE sp.stock_id = ?
     ORDER BY sp.price_date ASC`,
    [stockId]
  );
  return rows;
};

const getStockQuantities = async () => {
  const [rows] = await db.query(
    `SELECT s.stock_name, SUM(se.volume) as total_quantity
     FROM stock_entries se
     JOIN stocks s ON s.stock_id = se.stock_id
     GROUP BY s.stock_name
     ORDER BY s.stock_name`
  );
  return rows;
};

const getAllStocks = async () => {
  const [rows] = await db.query('SELECT id, name FROM stocks ORDER BY name');
  return rows;
};

module.exports = {
  getAllStockData,
  getStockQuantities,
  getStockById,
  getAllStocks
};
