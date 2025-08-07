import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { Spinner, ButtonGroup, Button, Modal, Form } from "react-bootstrap";
import dayjs from "dayjs";

const GoldCharts = () => {
  const [goldData, setGoldData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [range, setRange] = useState("1Y");
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState("#2ca02c");

  // Buy/Sell states
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [buySuccess, setBuySuccess] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false);
  const [buyError, setBuyError] = useState(null);
  const [sellError, setSellError] = useState(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3000/api/gold")
      .then(res => {
        const parsedData = res.data.map(item => ({
          price: parseFloat(item.price_per_gram),
          date: dayjs(item.price_date)
        }));
        setGoldData(parsedData);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  useEffect(() => {
    if (!goldData.length) return;

    const today = dayjs();
    let filtered = [];

    if (range === "1W") {
      filtered = goldData.filter(item => item.date.isAfter(today.subtract(7, 'day')));
    } else if (range === "1M") {
      filtered = goldData.filter(item => item.date.isAfter(today.subtract(1, 'month')));
    } else if (range === "1Y") {
      filtered = goldData.filter(item => item.date.isAfter(today.subtract(1, 'year')));
    }

    if (filtered.length > 1) {
      const oldPrice = filtered[0].price;
      const latestPrice = filtered[filtered.length - 1].price;
      setColor(latestPrice >= oldPrice ? "#2ca02c" : "#d62728");
    }

    setFilteredData(filtered);
  }, [range, goldData]);

  const dateData = filteredData.map(item =>
    range === "1Y" ? item.date.format("MMM") :
    range === "1M" ? item.date.format("MMM D") :
    item.date.format("DD MMM")
  );

  const priceData = filteredData.map(item => item.price);

  const chartOptions = {
    chart: { id: "gold-line-chart" },
    xaxis: {
      categories: dateData,
      labels: {
        rotate: -45,
        trim: true,
        style: { fontSize: "11px" },
        hideOverlappingLabels: true,
        maxHeight: 100
      },
      tickAmount: range === "1Y" ? 12 : (range === "1M" ? 6 : 7)
    },
    colors: [color],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    tooltip: { x: { format: "dd MMM yyyy" } }
  };

  const chartSeries = [{ name: "Gold Price", data: priceData }];

  const handleBuy = async () => {
    setBuyLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/buyGold", {
        quantity: parseFloat(quantity)
      });
      if (response.status === 200 || response.status === 201) {
        setBuySuccess(true);
      } else {
        setBuyError("Failed to buy gold.");
      }
    } catch (error) {
      console.error("Buy error:", error);
      setBuyError("Error buying gold.");
    } finally {
      setBuyLoading(false);
    }
  };

  const handleSell = async () => {
    setSellLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/sellGold", {
        quantity: parseFloat(quantity)
      });
      if (response.status === 200 || response.status === 201) {
        setSellSuccess(true);
      } else {
        setSellError("Failed to sell gold.");
      }
    } catch (error) {
      console.error("Sell error:", error);
      setSellError("Error selling gold.");
    } finally {
      setSellLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Gold Price Trend</h4>
      <ButtonGroup className="mb-3">
        <Button variant={range === "1W" ? "primary" : "outline-primary"} onClick={() => setRange("1W")}>1 Week</Button>
        <Button variant={range === "1M" ? "primary" : "outline-primary"} onClick={() => setRange("1M")}>1 Month</Button>
        <Button variant={range === "1Y" ? "primary" : "outline-primary"} onClick={() => setRange("1Y")}>1 Year</Button>
      </ButtonGroup>

      <Chart options={chartOptions} series={chartSeries} type="line" width="100%" height="400" />

      <div className="d-flex mt-3 mb-5" style={{ gap: "12px" }}>
        <Button variant="success" style={{ flex: 1 }} onClick={() => {
          setShowBuyModal(true);
          setBuySuccess(false);
          setBuyError(null);
          setQuantity(1);
        }}>
          Buy
        </Button>
        <Button variant="danger" style={{ flex: 1 }} onClick={() => {
          setShowSellModal(true);
          setSellSuccess(false);
          setSellError(null);
          setQuantity(1);
        }}>
          Sell
        </Button>
      </div>

      {/* Buy Modal */}
      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buy Gold</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {buySuccess ? (
            <div className="text-success mb-3">Gold bought successfully!</div>
          ) : (
            <>
              <Form.Group>
                <Form.Label>Quantity (grams)</Form.Label>
                <Form.Control
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Form.Group>
              {buyError && <div className="text-danger mt-2">{buyError}</div>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBuyModal(false)}>Cancel</Button>
          {!buySuccess && (
            <Button variant="success" onClick={handleBuy} disabled={buyLoading}>
              {buyLoading ? "Processing..." : "Confirm"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Sell Modal */}
      <Modal show={showSellModal} onHide={() => setShowSellModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sell Gold</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {sellSuccess ? (
            <div className="text-success mb-3">Gold sold successfully!</div>
          ) : (
            <>
              <Form.Group>
                <Form.Label>Quantity (grams)</Form.Label>
                <Form.Control
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Form.Group>
              {sellError && <div className="text-danger mt-2">{sellError}</div>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSellModal(false)}>Cancel</Button>
          {!sellSuccess && (
            <Button variant="danger" onClick={handleSell} disabled={sellLoading}>
              {sellLoading ? "Processing..." : "Confirm"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GoldCharts;
