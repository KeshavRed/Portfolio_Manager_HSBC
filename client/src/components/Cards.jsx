import Card from 'react-bootstrap/Card';
import React from 'react';

function CardsRow() {
  const cardTitles = [
    "Best Performing Stock",
    "Top Mutual Fund",
    "Trending Cryptocurrency",
    "Gold Investment"
  ];

  return (
    <div className="d-flex flex-wrap justify-content-center gap-4 p-4 mb-4">
      {cardTitles.map((title, index) => (
        <Card style={{ width: '18rem' }} key={index}>
          <Card.Body>
            <Card.Title>{title}</Card.Title>
            <Card.Text>
              Quick example text to build on the card title and content.
            </Card.Text>
            <Card.Link href="#">Link</Card.Link>
            <Card.Link href="#">Another</Card.Link>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default CardsRow;

