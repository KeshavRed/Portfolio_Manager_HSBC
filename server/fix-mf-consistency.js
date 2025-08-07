const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixMutualFundConsistency() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    console.log('Fixing Mutual Fund data consistency...\n');

    // 1. Ensure all mutual funds have current NAV entries
    console.log('1. Ensuring all mutual funds have current NAV entries...');
    const [mfsWithoutCurrentNAV] = await connection.execute(`
      SELECT mf.id, mf.name
      FROM mutual_funds mf
      LEFT JOIN mutual_fund_navs nav ON mf.id = nav.fund_id AND nav.nav_date = '2025-08-02'
      WHERE nav.nav IS NULL
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
        
        console.log(`   ✓ Added current NAV for ${mf.name}: ₹${latestNAV[0].nav}`);
      }
    }

    // 2. Verify mutual fund transactions have proper asset_type
    console.log('\n2. Verifying mutual fund transactions...');
    const [result] = await connection.execute(`
      UPDATE transactions t
      JOIN mutual_funds mf ON t.asset_id = mf.id
      SET t.asset_type = 'mutual_fund'
      WHERE (t.asset_type IS NULL OR t.asset_type = '' OR t.asset_type != 'mutual_fund')
      AND NOT EXISTS (SELECT 1 FROM stocks s WHERE s.id = t.asset_id)
    `);
    
    if (result.affectedRows > 0) {
      console.log(`   ✓ Fixed ${result.affectedRows} mutual fund transactions`);
    } else {
      console.log('   ✓ All mutual fund transactions are properly categorized');
    }

    // 3. Test NAV availability for all mutual funds
    console.log('\n3. Testing NAV availability for all mutual funds...');
    const [allMFs] = await connection.execute(`
      SELECT mf.id, mf.name,
             (SELECT nav FROM mutual_fund_navs WHERE fund_id = mf.id AND nav_date = '2025-08-02') as current_nav,
             (SELECT nav FROM mutual_fund_navs WHERE fund_id = mf.id ORDER BY nav_date DESC LIMIT 1) as latest_nav
      FROM mutual_funds mf
      ORDER BY mf.name
    `);

    let allHaveNAV = true;
    allMFs.forEach(mf => {
      const navToUse = mf.current_nav || mf.latest_nav;
      if (navToUse) {
        console.log(`   ✓ ${mf.name}: NAV ₹${navToUse}`);
      } else {
        console.log(`   ❌ ${mf.name}: No NAV available`);
        allHaveNAV = false;
      }
    });

    console.log('\n✅ Mutual Fund consistency fix completed!');
    console.log(`\nSummary:`);
    console.log(`- Total mutual funds: ${allMFs.length}`);
    console.log(`- All have NAV data: ${allHaveNAV ? 'Yes' : 'No'}`);
    console.log(`- Ready for buy/sell operations: ${allHaveNAV ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Error during mutual fund consistency fix:', error.message);
  } finally {
    await connection.end();
  }
}

fixMutualFundConsistency();