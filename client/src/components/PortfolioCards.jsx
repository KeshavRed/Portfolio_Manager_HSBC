import React from 'react';
import Card from 'react-bootstrap/Card';
import { FaMoneyBillWave, FaChartLine, FaShoppingCart, FaPiggyBank } from 'react-icons/fa';

function CardsRow() {
  const cardData = [
    {
      title: "Total Income",
      icon: <FaMoneyBillWave size={24} />,
      value: "₹1,00,000",
      bg: "linear-gradient(135deg, #e0f7fa, #e8f4fd)",
    },
    {
      title: "Total Savings",
      icon: <FaChartLine size={24} />,
      value: "₹1,00,000",
       bg: "linear-gradient(135deg, #e0f7fa, #e8f4fd)",
    },
    
  ];

  return (
    <div className="d-flex flex-wrap justify-content-start gap-4 mb-3">
      {cardData.map((item, index) => (
        <Card
          key={index}
          style={{
            width: '25rem',
            height:'10rem',
            background: item.bg,
            border: 'none',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 132, 218, 0.1)',
          }}
          className="p-3 mb-4 shadow-sm rounded-4 hover-card"
        >
          <Card.Body>
            <Card.Title style={{ fontSize: "1.4rem", display: "flex", alignItems: "center", fontWeight: "600" }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  padding: '8px',
                  marginRight: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ color: '#0084da' }}>
                  {item.icon}
                </div>
              </div>
              {item.title}
            </Card.Title>
            <Card.Text style={{ fontSize: "1.3rem", fontWeight: "500", color: "#004d61" , paddingLeft: "50px"}}>
              {item.value}
            </Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default CardsRow;
