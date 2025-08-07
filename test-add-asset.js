const fetch = require('node-fetch');

async function testAddAsset() {
  try {
    const testData = {
      asset_type: "stock",
      name: "Test Stock",
      quantity: "10",
      price_at_transaction: "100.50",
      transaction_date: "2024-01-15"
    };

    console.log('Testing POST to /api/add-new-asset with data:', testData);

    const response = await fetch('http://localhost:3000/api/add-new-asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      console.error('Error response:', responseText);
    }
  } catch (error) {
    console.error('Network error:', error.message);
  }
}

testAddAsset();