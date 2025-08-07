const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAutoIncrement() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'portfolio'
    });

    console.log('Fixing AUTO_INCREMENT...\n');

    const queries = [
      'ALTER TABLE stocks MODIFY COLUMN id INT AUTO_INCREMENT',
      'ALTER TABLE mutual_funds MODIFY COLUMN id INT AUTO_INCREMENT'
    ];

    for (const query of queries) {
      try {
        await connection.execute(query);
        console.log(`✓ ${query}`);
      } catch (error) {
        console.log(`✗ ${query}: ${error.message}`);
      }
    }

    await connection.end();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAutoIncrement();