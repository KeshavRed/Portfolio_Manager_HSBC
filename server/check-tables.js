const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'portfolio'
    });

    console.log('Checking table structures...\n');

    const tables = ['stocks', 'mutual_funds', 'transactions', 'stock_prices', 'mutual_fund_navs'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`=== ${table.toUpperCase()} TABLE ===`);
        rows.forEach(row => {
          console.log(`${row.Field}: ${row.Type} ${row.Key} ${row.Extra}`);
        });
        console.log('');
      } catch (error) {
        console.log(`Table ${table} doesn't exist or error: ${error.message}\n`);
      }
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();