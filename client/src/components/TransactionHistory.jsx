import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3000/api/transactions');
      console.log('API Response:', response.data);
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container style={{ marginTop: '5rem' }}>
        <h2>Loading transactions...</h2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ marginTop: '5rem' }}>
        <h2 className="mb-4">Transaction History</h2>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '5rem' }}>
      <h2 className="mb-4">Transaction History</h2>
      
      {transactions.length === 0 ? (
        <Alert variant="info">
          No transactions found. Start buying/selling stocks to see your transaction history.
        </Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Asset</th>
              <th>Asset Type</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                <td>{tx.asset_name || `${tx.asset_type} ID: ${tx.asset_id}`}</td>
                <td>
                  <Badge bg={tx.transaction_type === 'buy' ? 'success' : 'danger'}>
                    {tx.transaction_type.toUpperCase()}
                  </Badge>
                </td>
                <td>{tx.asset_type.toUpperCase()}</td>
                <td>{tx.quantity}</td>
                <td>₹{parseFloat(tx.price_at_transaction).toFixed(2)}</td>
                <td>₹{(tx.quantity * tx.price_at_transaction).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default TransactionHistory;