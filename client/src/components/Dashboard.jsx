import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import GoldOverview from './GoldOverview';
import StockCharts from './StockOverview';
import MFOverview from './MFOverview';


const Dashboard = () => {
  const [selected, setSelected] = useState("stocks");

  const renderOverview = () => {
    switch (selected) {
      case 'stocks':
        return <StockCharts />;
      case 'mfs':
        return <MFOverview />;
      case 'gold':
        return <GoldOverview />;
      default:
        return null;
    }
  };

  return (
    <Container className="pt-5" style={{ marginTop: '40px' }}>
      <h2 className="text-left pt-3 pb-3">Your Investments</h2>

      <Row className="g-4 justify-content-center">
        {[
          { title: 'Stocks', key: 'stocks' },
          { title: 'Mutual Funds', key: 'mfs' },
          { title: 'Gold', key: 'gold' },
        ].map(({ title, key }) => (
          <Col key={key} md={3} sm={6}>
            <Card
              onClick={() => setSelected(key)}
              style={{
                height: '100%',
                backgroundColor: '#e6f7ff',
                cursor: 'pointer',
                border: selected === key ? '2px solid #007bff' : 'none',
              }}
              className="shadow p-3 d-flex flex-column"
            >
              <Card.Body className="d-flex flex-column text-center">
                <Card.Title>{title}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="mt-4">{renderOverview()}</div>

   
    </Container>
  );
};

export default Dashboard;
