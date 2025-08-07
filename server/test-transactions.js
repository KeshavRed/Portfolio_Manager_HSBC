const db = require('./config/db');

async function testTransactions() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const [result] = await db.query('SELECT 1 as test');
    console.log('Database connected:', result);
    
    // Check transactions table
    const [transactions] = await db.query(`
      SELECT 
        t.id,
        t.asset_id,
        t.transaction_type,
        t.quantity,
        t.price_at_transaction,
        t.transaction_date,
        s.name AS asset_name
      FROM transactions t
      LEFT JOIN stocks s ON t.asset_id = s.id
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT 5
    `);
    
    console.log('Transactions found:', transactions.length);
    console.log('Sample transactions:', transactions);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

testTransactions();