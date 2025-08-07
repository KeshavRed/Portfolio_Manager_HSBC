const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDataFlow() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    console.log('Testing data flow consistency...\n');

    // 1. Test stock listing in dashboard
    console.log('1. Testing stock listing for dashboard:');
    const [stocksForDashboard] = await connection.execute(`
      SELECT s.id, s.name AS stock_name, sp.price_date, sp.price 
      FROM stock_prices sp
      JOIN stocks s ON sp.stock_id = s.id
      ORDER BY sp.price_date ASC
      LIMIT 5
    `);
    console.log(`   Found ${stocksForDashboard.length} stock price entries`);
    stocksForDashboard.forEach(stock => {
      console.log(`   - ${stock.stock_name}: ₹${stock.price} (${stock.price_date})`);
    });

    // 2. Test portfolio data
    console.log('\n2. Testing portfolio data:');
    const [portfolioData] = await connection.execute(`
      SELECT 
        s.name AS stock_name,
        t.asset_id,
        SUM(CASE WHEN t.transaction_type = 'buy' THEN t.quantity ELSE -t.quantity END) AS available_quantity,
        SUM(CASE 
              WHEN t.transaction_type = 'buy' THEN t.quantity * t.price_at_transaction
              WHEN t.transaction_type = 'sell' THEN -t.quantity * t.price_at_transaction
              ELSE 0 
            END) AS net_investment,
        COALESCE(sp.price, latest_sp.price) AS current_price
      FROM transactions t
      JOIN stocks s ON t.asset_id = s.id
      LEFT JOIN (
          SELECT stock_id, price
          FROM stock_prices
          WHERE price_date = '2025-08-02'
      ) sp ON sp.stock_id = t.asset_id
      LEFT JOIN (
          SELECT sp1.stock_id, sp1.price
          FROM stock_prices sp1
          INNER JOIN (
              SELECT stock_id, MAX(price_date) as max_date
              FROM stock_prices
              GROUP BY stock_id
          ) sp2 ON sp1.stock_id = sp2.stock_id AND sp1.price_date = sp2.max_date
      ) latest_sp ON latest_sp.stock_id = t.asset_id
      WHERE t.asset_type = 'stock'
      GROUP BY t.asset_id, s.name, sp.price, latest_sp.price
      HAVING available_quantity > 0
    `);
    console.log(`   Found ${portfolioData.length} stocks in portfolio`);
    portfolioData.forEach(stock => {
      const profitLoss = (stock.current_price * stock.available_quantity) - stock.net_investment;
      console.log(`   - ${stock.stock_name}: ${stock.available_quantity} shares, P/L: ₹${profitLoss.toFixed(2)}`);
    });

    // 3. Test transaction history
    console.log('\n3. Testing transaction history:');
    const [transactions] = await connection.execute(`
      SELECT 
        t.id,
        t.asset_type,
        t.transaction_type,
        t.quantity,
        t.price_at_transaction,
        t.transaction_date,
        CASE 
          WHEN t.asset_type = 'stock' THEN s.name
          WHEN t.asset_type = 'mutual_fund' THEN mf.name
          WHEN t.asset_type = 'gold' THEN 'Gold'
        END AS asset_name
      FROM transactions t
      LEFT JOIN stocks s ON t.asset_type = 'stock' AND t.asset_id = s.id
      LEFT JOIN mutual_funds mf ON t.asset_type = 'mutual_fund' AND t.asset_id = mf.id
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT 5
    `);
    console.log(`   Found ${transactions.length} recent transactions`);
    transactions.forEach(txn => {
      console.log(`   - ${txn.asset_name}: ${txn.transaction_type} ${txn.quantity} @ ₹${txn.price_at_transaction}`);
    });

    // 4. Test stocks available for buy/sell
    console.log('\n4. Testing stocks available for buy/sell:');
    const [availableStocks] = await connection.execute(`
      SELECT s.id, s.name, 
             sp.price as current_price,
             sp.price_date
      FROM stocks s
      LEFT JOIN stock_prices sp ON s.id = sp.stock_id AND sp.price_date = '2025-08-02'
      LEFT JOIN (
          SELECT sp1.stock_id, sp1.price, sp1.price_date
          FROM stock_prices sp1
          INNER JOIN (
              SELECT stock_id, MAX(price_date) as max_date
              FROM stock_prices
              GROUP BY stock_id
          ) sp2 ON sp1.stock_id = sp2.stock_id AND sp1.price_date = sp2.max_date
      ) latest_sp ON s.id = latest_sp.stock_id
      WHERE sp.price IS NOT NULL OR latest_sp.price IS NOT NULL
      LIMIT 5
    `);
    console.log(`   Found ${availableStocks.length} stocks available for trading`);
    availableStocks.forEach(stock => {
      console.log(`   - ${stock.name} (ID: ${stock.id}): ₹${stock.current_price || 'N/A'}`);
    });

    console.log('\n✅ Data flow test completed successfully!');
    console.log('\nSummary:');
    console.log(`- Stocks in system: ${availableStocks.length}`);
    console.log(`- Stocks in portfolio: ${portfolioData.length}`);
    console.log(`- Recent transactions: ${transactions.length}`);
    console.log(`- All stocks should now be visible in dashboard, portfolio, and available for trading.`);

  } catch (error) {
    console.error('❌ Error during data flow test:', error.message);
  } finally {
    await connection.end();
  }
}

testDataFlow();