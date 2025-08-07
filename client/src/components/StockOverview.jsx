import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Spinner, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const StockCharts = () => {
  const [stockData, setStockData] = useState([]);
  const [latestPrices, setLatestPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3000/api/stocks")
      .then(res => {
        const allData = res.data;

        const latestByCompany = {};
        allData.forEach(entry => {
          const date = dayjs(entry.price_date);
          if (
            !latestByCompany[entry.stock_name] ||
            dayjs(latestByCompany[entry.stock_name].price_date).isBefore(date)
          ) {
            latestByCompany[entry.stock_name] = entry;
          }
        });

        const latestList = Object.values(latestByCompany);
        setLatestPrices(latestList);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stock data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center text-primary">📈 Latest Stock Prices</h2>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Card className="shadow-sm border">
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead className="bg-primary text-white text-center">
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Latest Price (₹)</th>
                  <th>As of Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {latestPrices.map((stock, idx) => (
                  <tr key={stock.id || stock.stock_id}>
                    <td>{idx + 1}</td>
                    <td>{stock.stock_name}</td>
                    <td>₹ {parseFloat(stock.price).toFixed(2)}</td>
                    <td>{dayjs(stock.price_date).format("DD/MM/YYYY")}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/stocks/${stock.id || stock.stock_id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default StockCharts;
