const stockModel = require('../models/stockModel');

const getAllStockData = async (req, res) => {
  try {
    const data = await stockModel.getAllStockData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllStocks = async (req, res) => {
  try {
    const data = await stockModel.getAllStocks();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSingleStock = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await stockModel.getStockById(id);

    if (data.length === 0) {
      return res.status(404).json({ error: 'Stock not found or no price data.' });
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching stock:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllStockData,
  getAllStocks,
  getSingleStock
};

