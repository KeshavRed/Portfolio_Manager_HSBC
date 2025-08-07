const { getGoldPriceHistory, buyGold, sellGold, getGoldHoldings } = require('../controllers/goldController');
const goldModel = require('../models/goldModel');
const db = require('../config/db');

jest.mock('../models/goldModel');
jest.mock('../config/db');

describe('Gold Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    global.userbalance = 50000;
  });

  describe('getGoldPriceHistory', () => {
    it('should return gold price history', async () => {
      const mockData = [{ date: '2024-01-01', price: 5000 }];
      goldModel.getGoldPrices.mockResolvedValue(mockData);

      await getGoldPriceHistory(req, res);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors', async () => {
      goldModel.getGoldPrices.mockRejectedValue(new Error('DB Error'));
      await getGoldPriceHistory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('buyGold', () => {
    it('should buy gold successfully', async () => {
      req.body = { quantity: 10 };
      db.query.mockResolvedValueOnce([[{ price_per_gram: 5000 }]])
               .mockResolvedValueOnce([]);

      await buyGold(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(global.userbalance).toBe(0);
    });

    it('should return 404 when price not found', async () => {
      req.body = { quantity: 10 };
      db.query.mockResolvedValueOnce([[]]);

      await buyGold(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 for insufficient balance', async () => {
      req.body = { quantity: 100 };
      db.query.mockResolvedValueOnce([[{ price_per_gram: 1000 }]]);

      await buyGold(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getGoldHoldings', () => {
    it('should return gold holdings', async () => {
      db.query.mockResolvedValueOnce([[{ price_per_gram: 5000 }]])
               .mockResolvedValueOnce([[{ available_quantity: 10, net_investment: 45000 }]]);

      await getGoldHoldings(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return message for no holdings', async () => {
      db.query.mockResolvedValueOnce([[{ price_per_gram: 5000 }]])
               .mockResolvedValueOnce([[{ available_quantity: 0 }]]);

      await getGoldHoldings(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'No gold holdings' });
    });
  });
});