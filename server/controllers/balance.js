const fetchBalance = async (req, res) => {
  try {
    const data = global.userbalance;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateBalance = async (req, res) => {
  try {
    global.userbalance=100000;
    const data = global.userbalance;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  fetchBalance,
  updateBalance
};

