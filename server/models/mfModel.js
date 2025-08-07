const db = require('../config/db');

const getAllMutualFundData = async () => {
  const [rows] = await db.query(
    `SELECT mf.id, mf.name AS fund_name, nav.nav_date, nav.nav
     FROM mutual_fund_navs nav
     JOIN mutual_funds mf ON nav.fund_id = mf.id
     ORDER BY nav.nav_date ASC`
  );
  return rows;
};

const getMutualFundById = async (fundId) => {
  const [rows] = await db.query(
    `SELECT mf.name AS fund_name, nav.nav_date, nav.nav
     FROM mutual_fund_navs nav
     JOIN mutual_funds mf ON nav.fund_id = mf.id
     WHERE nav.fund_id = ?
     ORDER BY nav.nav_date ASC`,
    [fundId]
  );
  return rows;
};

const getAllMutualFunds = async () => {
  const [rows] = await db.query('SELECT id, name FROM mutual_funds ORDER BY name');
  return rows;
};

module.exports = {
  getAllMutualFundData,
  getMutualFundById,
  getAllMutualFunds
};
