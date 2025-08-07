import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import { Button, Dropdown, ButtonGroup, Spinner, Modal, Form } from "react-bootstrap";

const StockDetails = () => {
  const { id } = useParams();
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [stockName, setStockName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("1M");

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState(null);
  const [buySuccess, setBuySuccess] = useState(false);

  const [showSellModal, setShowSellModal] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState(null);
  const [sellSuccess, setSellSuccess] = useState(false);



  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/stocks/${id}`);
        const data = response.data;

        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => new Date(a.price_date) - new Date(b.price_date));
          setStockData(sorted);
          setStockName(sorted[0]?.stock_name || "Unknown Stock");
        } else {
          console.error("Expected array but got:", data);
          setStockData([]);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setStockData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [id]);

  useEffect(() => {
    const filterData = () => {
      const now = new Date();
      let fromDate;

      switch (filter) {
        case "1W":
          fromDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "1M":
          fromDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "1Y":
          fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          fromDate = null;
      }

      const result = fromDate
        ? stockData.filter(item => new Date(item.price_date) >= fromDate)
        : stockData;

      setFilteredData(result);
    };

    filterData();
  }, [filter, stockData]);

  const getLineColor = () => {
    if (filteredData.length < 2) return "#000";

    const latestPrice = parseFloat(filteredData[filteredData.length - 1]?.price);
    let comparePrice = null;

    if (filter === "1W") {
      const weekAgoDate = new Date();
      weekAgoDate.setDate(weekAgoDate.getDate() - 7);
      comparePrice = stockData.find(d => new Date(d.price_date) >= weekAgoDate)?.price;
    } else if (filter === "1Y") {
      const yearAgoDate = new Date();
      yearAgoDate.setFullYear(yearAgoDate.getFullYear() - 1);
      comparePrice = stockData.find(d => new Date(d.price_date) >= yearAgoDate)?.price;
    }

    if (!comparePrice || isNaN(latestPrice)) return "#000";

    return latestPrice >= comparePrice
      ? getComputedStyle(document.documentElement).getPropertyValue('--bs-success') || "#198754"
      : getComputedStyle(document.documentElement).getPropertyValue('--bs-danger') || "#dc3545";
  };

  const chartOptions = {
    chart: {
      id: "stock-price-chart",
      toolbar: { show: true },
      type: "line"
    },
    xaxis: {
      type: "datetime",
      title: { text: "Date" },
      labels: {
        rotate: -45,
        style: { fontSize: "11px" },
        formatter: function (value) {
          const date = new Date(value);
          return filter === "1Y"
            ? date.toLocaleDateString("en-GB", { month: "short" })
            : date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "2-digit"
            });
        }
      }
    },
    yaxis: {
      title: { text: "Price (₹)" },
      labels: {
        formatter: (value) => Number(value).toFixed(2),
        style: { fontSize: "12px" }
      }
    },
    title: {
      text: `${stockName} Price Trend`,
      align: "center"
    },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        distributed: false
      }
    },
    colors: [getLineColor()]
  };

  const chartSeries = [
    {
      name: "Price (₹)",
      data: filteredData.map((item) => ({
        x: new Date(item.price_date).getTime(),
        y: parseFloat(item.price)
      }))
    }
  ];

  return (
    <div className="container mt-4">
      <h4 className="mb-4 text-center">{stockName} Price Trend</h4>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <Dropdown onSelect={(e) => setFilter(e)} as={ButtonGroup}>
          <Dropdown.Toggle variant="outline-primary" id="filter-dropdown">
            {filter}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="1W">1 Week</Dropdown.Item>
            <Dropdown.Item eventKey="1M">1 Month</Dropdown.Item>
            <Dropdown.Item eventKey="1Y">1 Year</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>


      </div>

      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : filteredData.length === 0 ? (
        <p className="text-center text-danger">No data found for this stock.</p>
      ) : (
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={500}
          width="100%"
        />
      )}


      <div style={{ display: "flex", width: "100%" }}>
        <Button
          variant="success"
          style={{ flex: 1, marginRight: "8px" }}
          onClick={() => {
            setShowBuyModal(true);
            setBuySuccess(false);
            setBuyError(null);
            setQuantity(1);
          }}
        >
          Buy
        </Button>

        <Button
          variant="danger"
          style={{ flex: 1, marginRight: "8px" }}
          onClick={() => {
            setShowSellModal(true);
            setSellSuccess(false);
            setSellError(null);
            setQuantity(1);
          }}
        >
          Sell
        </Button>
      </div>

      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buy Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {buySuccess ? (
            <div className="text-success mb-3">Stock bought successfully!</div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Stock ID</Form.Label>
                <Form.Control type="text" value={id} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Form.Group>
              {buyError && <div className="text-danger">{buyError}</div>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBuyModal(false)}>
            Cancel
          </Button>
          {!buySuccess && (
            <Button variant="success" onClick={async () => {
              try {
                setBuyLoading(true);
                setBuyError(null);
                const response = await axios.post("http://localhost:3000/api/portfolio/buy", {
                  asset_id: id,
                  quantity: parseInt(quantity)
                });
                if (response.status === 200 || response.status === 201) {
                  setBuySuccess(true);
                } else {
                  setBuyError("Failed to buy stock.");
                }
              } catch (error) {
                console.error("Buy error:", error);
                setBuyError("Error buying stock.");
              } finally {
                setBuyLoading(false);
              }
            }} disabled={buyLoading}>
              {buyLoading ? "Processing..." : "Confirm"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>


     <Modal show={showSellModal} onHide={() => setShowSellModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sell Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {sellSuccess ? (
            <div className="text-success mb-3">Stock sold successfully!</div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Stock ID</Form.Label>
                <Form.Control type="text" value={id} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Form.Group>
              {sellError && <div className="text-danger">{sellError}</div>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSellModal(false)}>
            Cancel
          </Button>
          {!sellSuccess && (
            <Button variant="success" onClick={async () => {
              try {
                setSellLoading(true);
                setSellError(null);
                const response = await axios.post("http://localhost:3000/api/portfolio/sell", {
                  asset_id: id,
                  quantity: parseInt(quantity)
                });
                if (response.status === 200 || response.status === 201) {
                  setSellSuccess(true);
                } else {
                  setSellError("Failed to buy stock.");
                }
              } catch (error) {
                console.error("Buy error:", error);
                setSellError("Error buying stock.");
              } finally {
                setSellLoading(false);
              }
            }} disabled={sellLoading}>
              {sellLoading ? "Processing..." : "Confirm"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>





    </div>
  );
};

export default StockDetails;
