const { getAllStockData, getAllStocks, getSingleStock } = require('../controllers/stockController');
const stockModel = require('../models/stockModel');

jest.mock('../models/stockModel');

describe('Stock Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getAllStockData', () => {
    it('should return all stock data', async () => {
      const mockData = [{ id: 1, name: 'AAPL' }];
      stockModel.getAllStockData.mockResolvedValue(mockData);

      await getAllStockData(req, res);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors', async () => {
      stockModel.getAllStockData.mockRejectedValue(new Error('DB Error'));
      await getAllStockData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAllStocks', () => {
    it('should return all stocks', async () => {
      const mockData = [{ id: 1, name: 'AAPL' }];
      stockModel.getAllStocks.mockResolvedValue(mockData);

      await getAllStocks(req, res);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });

  describe('getSingleStock', () => {
    it('should return single stock data', async () => {
      req.params = { id: '1' };
      const mockData = [{ id: 1, name: 'AAPL', price: 150 }];
      stockModel.getStockById.mockResolvedValue(mockData);

      await getSingleStock(req, res);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should return 404 for non-existent stock', async () => {
      req.params = { id: '999' };
      stockModel.getStockById.mockResolvedValue([]);

      await getSingleStock(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});