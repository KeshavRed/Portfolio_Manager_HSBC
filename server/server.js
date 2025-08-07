const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

global.userbalance=100000;
// Routes
const stockRoutes = require('./routes/stockRoutes');
const balance= require('./routes/balanceRoute');
const goldRoutes = require('./routes/goldRoute');
const mutualFundRoutes = require('./routes/mfRoute');
const portfolioRoutes = require('./routes/portfolioRoute');
const transactionRoutes = require('./routes/transactionsRoute');
const investmentRoutes = require('./routes/investment'); 

app.use('/api', investmentRoutes);
app.use('/api', goldRoutes);
app.use('/api', stockRoutes);
app.use('/api', balance);
app.use('/api', mutualFundRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);


app.get('/api/debugBalance', (req, res) => {
  res.json({ balance: global.userbalance });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});





app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



/*const express = require('express');
const app = express();
const port = 3001;

global.userbalance = 100000;

app.get('/api/debugBalance', (req, res) => {
  res.json({ balance: global.userbalance });
});
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
*/
