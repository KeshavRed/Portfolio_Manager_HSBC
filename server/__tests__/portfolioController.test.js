const { buyStock, sellStock, getPortfolio, getMutualFundPortfolio } = require('../controllers/portfolioController');
const db = require('../config/db');

jest.mock('../config/db');

describe('Portfolio Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    global.userbalance = 50000;
  });

  describe('buyStock', () => {
    it('should buy stock successfully', async () => {
      req.body = { asset_id: 1, quantity: 10 };
      db.query.mockResolvedValueOnce([[{ price: 100 }]])
               .mockResolvedValueOnce([[{ price: 100 }]])
               .mockResolvedValueOnce([]);

      await buyStock(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(global.userbalance).toBe(49000);
    });



    it('should return 400 for insufficient balance', async () => {
      req.body = { asset_id: 1, quantity: 1000 };
      db.query.mockResolvedValueOnce([[{ price: 100 }]])
               .mockResolvedValueOnce([[{ price: 100 }]]);

      await buyStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('sellStock', () => {
    it('should sell stock successfully', async () => {
      req.body = { asset_id: 1, quantity: 5 };
      db.query.mockResolvedValueOnce([[{ price: 110 }]])
               .mockResolvedValueOnce([[{ price: 110 }]])
               .mockResolvedValueOnce([[{ available_quantity: 10 }]])
               .mockResolvedValueOnce([]);

      await sellStock(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(global.userbalance).toBe(50550);
    });

    it('should return 400 for insufficient quantity', async () => {
      req.body = { asset_id: 1, quantity: 20 };
      db.query.mockResolvedValueOnce([[{ price: 110 }]])
               .mockResolvedValueOnce([[{ price: 110 }]])
               .mockResolvedValueOnce([[{ available_quantity: 5 }]]);

      await sellStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getPortfolio', () => {
    it('should return portfolio data', async () => {
      const mockPortfolio = [{ stock_name: 'AAPL', available_quantity: 10 }];
      db.query.mockResolvedValueOnce([mockPortfolio]);

      await getPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPortfolio);
    });
  });

  describe('getMutualFundPortfolio', () => {
    it('should return mutual fund portfolio', async () => {
      const mockPortfolio = [{ fund_name: 'Fund A', available_quantity: 100 }];
      db.query.mockResolvedValueOnce([mockPortfolio]);

      await getMutualFundPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPortfolio);
    });
  });
});