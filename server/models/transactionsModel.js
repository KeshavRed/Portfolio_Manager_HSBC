const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  asset_type: {
    type: DataTypes.ENUM('stock', 'mutual_fund', 'gold'),
    allowNull: false
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transaction_type: {
    type: DataTypes.ENUM('buy', 'sell'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  price_at_transaction: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  transaction_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  current_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
});

module.exports = Transaction;
