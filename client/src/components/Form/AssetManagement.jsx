import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Row, Col, Card } from "react-bootstrap";
import './AssetManager.css';

const AssetManager = () => {
  const [form, setForm] = useState({
    asset_type: "stock",
    name: "",
    quantity: "",
    price_at_transaction: "",
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch('http://localhost:3000/api/transactions/add-new-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setMessage(`New ${form.asset_type} "${form.name}" added to your portfolio successfully!`);
        setForm({
          asset_type: "stock",
          name: "",
          quantity: "",
          price_at_transaction: "",
          transaction_date: new Date().toISOString().split('T')[0]
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add new asset');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="container" style={{ marginTop: '5rem' }}>
      <Row>
        <Col md={8} className="mx-auto">
          <h2 className="text-center mb-4">Add New Asset to Portfolio</h2>
          
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Card className="p-4 shadow">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Asset Type</Form.Label>
                <Form.Select
                  name="asset_type"
                  value={form.asset_type}
                  onChange={handleChange}
                  required
                >
                  <option value="stock">Stock</option>
                  <option value="mutual_fund">Mutual Fund</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  {form.asset_type === 'stock' ? 'Stock Name' : 'Mutual Fund Name'}
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={`Enter ${form.asset_type === 'stock' ? 'stock' : 'mutual fund'} name`}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Initial Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Purchase Price</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="price_at_transaction"
                      value={form.price_at_transaction}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Purchase Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="transaction_date"
                      value={form.transaction_date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="text-center">
                <Button type="submit" variant="primary" size="lg">
                  Add to Portfolio
                </Button>
              </div>
            </Form>
          </Card>
          
          <div className="mt-4 text-center">
            <p className="text-muted">
              This will add a new {form.asset_type} to your database and create an initial purchase transaction.
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AssetManager;