const { fetchBalance, updateBalance } = require('../controllers/balance');

describe('Balance Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    global.userbalance = 50000;
  });

  describe('fetchBalance', () => {
    it('should return current balance', async () => {
      await fetchBalance(req, res);
      expect(res.json).toHaveBeenCalledWith(50000);
    });
  });

  describe('updateBalance', () => {
    it('should reset balance to 100000', async () => {
      await updateBalance(req, res);
      expect(global.userbalance).toBe(100000);
      expect(res.json).toHaveBeenCalledWith(100000);
    });
  });
});