const axios = require('axios');

async function testMutualFundBuy() {
  try {
    console.log('Testing Mutual Fund Buy API...\n');

    // Test buying a mutual fund
    const buyData = {
      fund_id: 1, // SBI Bluechip Fund
      quantity: 10,
      transaction_date: '2025-01-15'
    };

    console.log('Attempting to buy mutual fund with data:', buyData);

    const response = await axios.post('http://localhost:3000/api/buyMutualFund', buyData);
    
    console.log('✅ Buy successful!');
    console.log('Response:', response.data);

  } catch (error) {
    if (error.response) {
      console.log('❌ Buy failed with error:', error.response.data);
      console.log('Status:', error.response.status);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Only run if server is running
testMutualFundBuy();