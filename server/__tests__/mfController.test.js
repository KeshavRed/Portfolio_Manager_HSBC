const { getAllMutualFundData, getAllMutualFunds, getSingleMutualFund, buyMutualFund, sellMutualFund } = require('../controllers/mfController');
const mutualFundModel = require('../models/mfModel');
const db = require('../config/db');

jest.mock('../models/mfModel');
jest.mock('../config/db');

describe('Mutual Fund Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    global.userbalance = 50000;
  });

  describe('getAllMutualFundData', () => {
    it('should return all mutual fund data', async () => {
      const mockData = [{ id: 1, name: 'Fund A' }];
      mutualFundModel.getAllMutualFundData.mockResolvedValue(mockData);

      await getAllMutualFundData(req, res);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });

  describe('getSingleMutualFund', () => {
    it('should return single mutual fund', async () => {
      req.params.id = '1';
      const mockData = [{ id: 1, name: 'Fund A' }];
      mutualFundModel.getMutualFundById.mockResolvedValue(mockData);

      await getSingleMutualFund(req, res);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should return 404 for non-existent fund', async () => {
      req.params.id = '999';
      mutualFundModel.getMutualFundById.mockResolvedValue([]);

      await getSingleMutualFund(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('buyMutualFund', () => {
    it('should buy mutual fund successfully', async () => {
      req.body = { fund_id: 1, quantity: 10 };
      db.query.mockResolvedValueOnce([[{ nav: 100 }]])
               .mockResolvedValueOnce([[{ nav: 100 }]])
               .mockResolvedValueOnce([]);

      await buyMutualFund(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(global.userbalance).toBe(49000);
    });

    it('should return 400 for insufficient balance', async () => {
      req.body = { fund_id: 1, quantity: 1000 };
      db.query.mockResolvedValueOnce([[{ nav: 100 }]])
               .mockResolvedValueOnce([[{ nav: 100 }]]);

      await buyMutualFund(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});