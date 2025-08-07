const { getTransactions, addTransaction } = require('../controllers/transactionController');
const db = require('../config/db');

jest.mock('../config/db');

describe('Transaction Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getTransactions', () => {
    it('should return all transactions', async () => {
      const mockTransactions = [
        { id: 1, asset_type: 'stock', transaction_type: 'buy', quantity: 10 },
        { id: 2, asset_type: 'gold', transaction_type: 'sell', quantity: 5 }
      ];
      db.query.mockResolvedValueOnce([mockTransactions]);

      await getTransactions(req, res);
      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database connection failed'));

      await getTransactions(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addTransaction', () => {
    it('should add stock transaction successfully', async () => {
      req.body = {
        asset_type: 'stock',
        asset_id: 1,
        transaction_type: 'buy',
        quantity: 10,
        price_at_transaction: 100
      };
      
      db.query.mockResolvedValueOnce([[{ price: 105 }]])
               .mockResolvedValueOnce([]);

      await addTransaction(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction added successfully' });
    });

    it('should add mutual fund transaction successfully', async () => {
      req.body = {
        asset_type: 'mutual_fund',
        asset_id: 1,
        transaction_type: 'buy',
        quantity: 50,
        price_at_transaction: 25
      };
      
      db.query.mockResolvedValueOnce([[{ nav: 26 }]])
               .mockResolvedValueOnce([]);

      await addTransaction(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction added successfully' });
    });

    it('should add gold transaction successfully', async () => {
      req.body = {
        asset_type: 'gold',
        asset_id: 1,
        transaction_type: 'buy',
        quantity: 10,
        price_at_transaction: 5000
      };
      
      db.query.mockResolvedValueOnce([[{ price_per_gram: 5100 }]])
               .mockResolvedValueOnce([]);

      await addTransaction(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction added successfully' });
    });

    it('should handle database errors', async () => {
      req.body = {
        asset_type: 'stock',
        asset_id: 1,
        transaction_type: 'buy',
        quantity: 10,
        price_at_transaction: 100
      };
      
      db.query.mockRejectedValue(new Error('Database error'));

      await addTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});