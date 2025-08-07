const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    const response = await axios.get('http://localhost:3000/api/transactions');
    console.log('API Response:', response.data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();