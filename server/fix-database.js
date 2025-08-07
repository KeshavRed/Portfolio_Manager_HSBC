const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAutoIncrement() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Fix AUTO_INCREMENT for each table
    await connection.execute('ALTER TABLE stocks MODIFY COLUMN id INT AUTO_INCREMENT');
    await connection.execute('ALTER TABLE mutual_funds MODIFY COLUMN id INT AUTO_INCREMENT');
    await connection.execute('ALTER TABLE transactions MODIFY COLUMN id INT AUTO_INCREMENT');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('AUTO_INCREMENT fixed for all tables');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixAutoIncrement();