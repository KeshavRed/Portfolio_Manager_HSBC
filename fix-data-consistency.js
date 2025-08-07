const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDataConsistency() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    console.log('Starting data consistency fix...');

    // 1. Fix stocks without current price entries
    console.log('Fixing stock price entries...');
    const [stocksWithoutCurrentPrice] = await connection.execute(`
      SELECT s.id, s.name, sp.price, sp.price_date
      FROM stocks s
      LEFT JOIN stock_prices sp ON s.id = sp.stock_id AND sp.price_date = '2025-08-02'
      LEFT JOIN (
        SELECT stock_id, price, price_date,
               ROW_NUMBER() OVER (PARTITION BY stock_id ORDER BY price_date DESC) as rn
        FROM stock_prices
      ) latest_sp ON s.id = latest_sp.stock_id AND latest_sp.rn = 1
      WHERE sp.price IS NULL AND latest_sp.price IS NOT NULL
    `);

    for (const stock of stocksWithoutCurrentPrice) {
      const [latestPrice] = await connection.execute(
        'SELECT price FROM stock_prices WHERE stock_id = ? ORDER BY price_date DESC LIMIT 1',
        [stock.id]
      );
      
      if (latestPrice.length > 0) {
        await connection.execute(`
          INSERT INTO stock_prices (stock_id, price_date, price)
          VALUES (?, '2025-08-02', ?)
          ON DUPLICATE KEY UPDATE price = VALUES(price)
        `, [stock.id, latestPrice[0].price]);
        
        console.log(`Added current price for stock: ${stock.name}`);
      }
    }

    // 2. Fix mutual funds without current NAV entries
    console.log('Fixing mutual fund NAV entries...');
    const [mfsWithoutCurrentNAV] = await connection.execute(`
      SELECT mf.id, mf.name
      FROM mutual_funds mf
      LEFT JOIN mutual_fund_navs mfn ON mf.id = mfn.fund_id AND mfn.nav_date = '2025-08-02'
      WHERE mfn.nav IS NULL
    `);

    for (const mf of mfsWithoutCurrentNAV) {
      const [latestNAV] = await connection.execute(
        'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? ORDER BY nav_date DESC LIMIT 1',
        [mf.id]
      );
      
      if (latestNAV.length > 0) {
        await connection.execute(`
          INSERT INTO mutual_fund_navs (fund_id, nav_date, nav)
          VALUES (?, '2025-08-02', ?)
          ON DUPLICATE KEY UPDATE nav = VALUES(nav)
        `, [mf.id, latestNAV[0].nav]);
        
        console.log(`Added current NAV for mutual fund: ${mf.name}`);
      }
    }

    // 3. Fix transactions missing asset_type
    console.log('Fixing transaction asset_type entries...');
    await connection.execute(`
      UPDATE transactions t
      JOIN stocks s ON t.asset_id = s.id
      SET t.asset_type = 'stock'
      WHERE t.asset_type IS NULL OR t.asset_type = ''
    `);

    await connection.execute(`
      UPDATE transactions t
      JOIN mutual_funds mf ON t.asset_id = mf.id
      SET t.asset_type = 'mutual_fund'
      WHERE (t.asset_type IS NULL OR t.asset_type = '') 
      AND NOT EXISTS (SELECT 1 FROM stocks s WHERE s.id = t.asset_id)
    `);

    // 4. Fix transactions missing user_id
    await connection.execute(`
      UPDATE transactions 
      SET user_id = 1 
      WHERE user_id IS NULL
    `);

    console.log('Data consistency fix completed successfully!');
    
    // Verify the fixes
    const [stockCount] = await connection.execute('SELECT COUNT(*) as count FROM stocks');
    const [stockPriceCount] = await connection.execute('SELECT COUNT(*) as count FROM stock_prices WHERE price_date = "2025-08-02"');
    const [transactionCount] = await connection.execute('SELECT COUNT(*) as count FROM transactions WHERE asset_type IS NOT NULL');
    
    console.log(`\nVerification:`);
    console.log(`- Total stocks: ${stockCount[0].count}`);
    console.log(`- Stocks with current prices: ${stockPriceCount[0].count}`);
    console.log(`- Transactions with asset_type: ${transactionCount[0].count}`);

  } catch (error) {
    console.error('Error during data consistency fix:', error.message);
  } finally {
    await connection.end();
  }
}

fixDataConsistency();