const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMutualFundFunctionality() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    console.log('Testing Mutual Fund functionality...\n');

    // 1. Check mutual funds and their NAV data
    console.log('1. Checking mutual funds and NAV data:');
    const [mutualFunds] = await connection.execute(`
      SELECT mf.id, mf.name, 
             COUNT(nav.id) as nav_entries,
             MAX(nav.nav_date) as latest_nav_date,
             (SELECT nav FROM mutual_fund_navs WHERE fund_id = mf.id ORDER BY nav_date DESC LIMIT 1) as latest_nav
      FROM mutual_funds mf
      LEFT JOIN mutual_fund_navs nav ON mf.id = nav.fund_id
      GROUP BY mf.id, mf.name
      ORDER BY mf.name
    `);

    console.log(`   Found ${mutualFunds.length} mutual funds:`);
    mutualFunds.forEach(mf => {
      console.log(`   - ${mf.name} (ID: ${mf.id}): ${mf.nav_entries} NAV entries, Latest: ₹${mf.latest_nav || 'N/A'}`);
    });

    // 2. Check for mutual funds without current NAV (2025-08-02)
    console.log('\n2. Checking mutual funds without current NAV:');
    const [mfsWithoutCurrentNAV] = await connection.execute(`
      SELECT mf.id, mf.name
      FROM mutual_funds mf
      LEFT JOIN mutual_fund_navs nav ON mf.id = nav.fund_id AND nav.nav_date = '2025-08-02'
      WHERE nav.nav IS NULL
    `);

    if (mfsWithoutCurrentNAV.length > 0) {
      console.log(`   Found ${mfsWithoutCurrentNAV.length} mutual funds without current NAV:`);
      mfsWithoutCurrentNAV.forEach(mf => {
        console.log(`   - ${mf.name} (ID: ${mf.id})`);
      });
      
      // Fix missing current NAV entries
      console.log('\n   Fixing missing current NAV entries...');
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
          
          console.log(`   ✓ Added current NAV for ${mf.name}: ₹${latestNAV[0].nav}`);
        }
      }
    } else {
      console.log('   ✓ All mutual funds have current NAV entries');
    }

    // 3. Test mutual fund portfolio data
    console.log('\n3. Testing mutual fund portfolio data:');
    const [mfPortfolio] = await connection.execute(`
      SELECT 
        mf.name AS fund_name,
        t.asset_id,
        SUM(CASE WHEN t.transaction_type = 'buy' THEN t.quantity ELSE -t.quantity END) AS available_quantity,
        SUM(CASE 
              WHEN t.transaction_type = 'buy' THEN t.quantity * t.price_at_transaction
              WHEN t.transaction_type = 'sell' THEN -t.quantity * t.price_at_transaction
              ELSE 0 
            END) AS net_investment,
        COALESCE(nav.nav, latest_nav.nav) AS current_price
      FROM transactions t
      JOIN mutual_funds mf ON t.asset_id = mf.id
      LEFT JOIN (
          SELECT fund_id, nav
          FROM mutual_fund_navs
          WHERE nav_date = '2025-08-02'
      ) nav ON nav.fund_id = t.asset_id
      LEFT JOIN (
          SELECT nav1.fund_id, nav1.nav
          FROM mutual_fund_navs nav1
          INNER JOIN (
              SELECT fund_id, MAX(nav_date) as max_date
              FROM mutual_fund_navs
              GROUP BY fund_id
          ) nav2 ON nav1.fund_id = nav2.fund_id AND nav1.nav_date = nav2.max_date
      ) latest_nav ON latest_nav.fund_id = t.asset_id
      WHERE t.asset_type = 'mutual_fund'
      GROUP BY t.asset_id, mf.name, nav.nav, latest_nav.nav
      HAVING available_quantity > 0
    `);

    console.log(`   Found ${mfPortfolio.length} mutual funds in portfolio:`);
    mfPortfolio.forEach(mf => {
      const profitLoss = (mf.current_price * mf.available_quantity) - mf.net_investment;
      console.log(`   - ${mf.fund_name}: ${mf.available_quantity} units, P/L: ₹${profitLoss.toFixed(2)}`);
    });

    // 4. Test buy functionality simulation
    console.log('\n4. Testing buy functionality (simulation):');
    if (mutualFunds.length > 0) {
      const testFund = mutualFunds[0];
      console.log(`   Testing buy for: ${testFund.name} (ID: ${testFund.id})`);
      
      // Simulate the buy query logic
      let [[navForBuy]] = await connection.execute(
        'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? AND nav_date = ?',
        [testFund.id, '2025-08-02']
      );
      
      if (!navForBuy) {
        [[navForBuy]] = await connection.execute(
          'SELECT nav FROM mutual_fund_navs WHERE fund_id = ? ORDER BY nav_date DESC LIMIT 1',
          [testFund.id]
        );
      }
      
      if (navForBuy) {
        console.log(`   ✓ NAV available for buy: ₹${navForBuy.nav}`);
      } else {
        console.log(`   ❌ No NAV available for buy`);
      }
    }

    console.log('\n✅ Mutual Fund functionality test completed!');

  } catch (error) {
    console.error('❌ Error during mutual fund test:', error.message);
  } finally {
    await connection.end();
  }
}

testMutualFundFunctionality();