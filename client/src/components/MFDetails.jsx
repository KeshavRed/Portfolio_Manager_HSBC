import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import { Button, Dropdown, ButtonGroup, Spinner, Modal, Form, Alert } from "react-bootstrap";

const MFDetails = () => {
  const { id } = useParams();
  const [navData, setNavData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fundName, setFundName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("1M");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [currentNav, setCurrentNav] = useState(0);

  useEffect(() => {
    const fetchMFData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/mfs/${id}`);
        const data = response.data;

        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => new Date(a.nav_date) - new Date(b.nav_date));
          setNavData(sorted);
          setFundName(sorted[0]?.fund_name || "Unknown Fund");
          setCurrentNav(sorted[sorted.length - 1]?.nav || 0);
        } else {
          console.error("Expected array but got:", data);
          setNavData([]);
        }
      } catch (error) {
        console.error("Error fetching mutual fund data:", error);
        setNavData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMFData();
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
        ? navData.filter(item => new Date(item.nav_date) >= fromDate)
        : navData;

      setFilteredData(result);
    };

    filterData();
  }, [filter, navData]);

  const getLineColor = () => {
    if (filteredData.length < 2) return "#000";

    const latestNAV = parseFloat(filteredData[filteredData.length - 1]?.nav);
    let compareNAV = null;

    if (filter === "1W") {
      const weekAgoDate = new Date();
      weekAgoDate.setDate(weekAgoDate.getDate() - 7);
      compareNAV = navData.find(d => new Date(d.nav_date) >= weekAgoDate)?.nav;
    } else if (filter === "1Y") {
      const yearAgoDate = new Date();
      yearAgoDate.setFullYear(yearAgoDate.getFullYear() - 1);
      compareNAV = navData.find(d => new Date(d.nav_date) >= yearAgoDate)?.nav;
    }

    if (!compareNAV || isNaN(latestNAV)) return "#000";

    return latestNAV >= compareNAV
      ? getComputedStyle(document.documentElement).getPropertyValue('--bs-success') || "#198754"
      : getComputedStyle(document.documentElement).getPropertyValue('--bs-danger') || "#dc3545";
  };

  const chartOptions = {
    chart: {
      id: "mf-nav-chart",
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
      title: { text: "NAV (₹)" },
      labels: {
        formatter: (value) => Number(value).toFixed(2),
        style: { fontSize: "12px" }
      }
    },
    title: {
      text: `${fundName} NAV Trend`,
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

  const handleBuy = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/buyMutualFund', {
        fund_id: id,
        quantity: parseFloat(quantity)
      });
      setAlert({ show: true, message: response.data.message, variant: "success" });
      setShowBuyModal(false);
      setQuantity("");
    } catch (error) {
      setAlert({ show: true, message: error.response?.data?.message || "Transaction failed", variant: "danger" });
    }
  };

  const handleSell = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/sellMutualFund', {
        fund_id: id,
        quantity: parseFloat(quantity)
      });
      setAlert({ show: true, message: response.data.message, variant: "success" });
      setShowSellModal(false);
      setQuantity("");
    } catch (error) {
      setAlert({ show: true, message: error.response?.data?.message || "Transaction failed", variant: "danger" });
    }
  };

  const chartSeries = [
    {
      name: "NAV (₹)",
      data: filteredData.map((item) => ({
        x: new Date(item.nav_date).getTime(),
        y: parseFloat(item.nav)
      }))
    }
  ];

  return (
    <div className="container mt-4">
      <h4 className="mb-4 text-center">{fundName} NAV Trend</h4>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <Dropdown onSelect={(e) => setFilter(e)} as={ButtonGroup}>
          <Dropdown.Toggle variant="outline-success" id="filter-dropdown">
            {filter}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="1W">1 Week</Dropdown.Item>
            <Dropdown.Item eventKey="1M">1 Month</Dropdown.Item>
            <Dropdown.Item eventKey="1Y">1 Year</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <div>
          <Button variant="success" className="me-2" onClick={() => setShowBuyModal(true)}>Invest</Button>
          <Button variant="danger" onClick={() => setShowSellModal(true)}>Redeem</Button>
        </div>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ show: false, message: "", variant: "" })} dismissible>
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="success" />
        </div>
      ) : filteredData.length === 0 ? (
        <p className="text-center text-danger">No data found for this mutual fund.</p>
      ) : (
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={500}
          width="100%"
        />
      )}

      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buy {fundName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current NAV: ₹{currentNav}</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity (Units)</Form.Label>
              <Form.Control
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Transaction Date</Form.Label>
              <Form.Control
                type="text"
                value={new Date().toLocaleDateString()}
                readOnly
              />
            </Form.Group>
            {quantity && <p>Total Cost: ₹{(parseFloat(quantity) * currentNav).toFixed(2)}</p>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBuyModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleBuy} disabled={!quantity}>Buy</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSellModal} onHide={() => setShowSellModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sell {fundName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current NAV: ₹{currentNav}</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity (Units)</Form.Label>
              <Form.Control
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Transaction Date</Form.Label>
              <Form.Control
                type="text"
                value={new Date().toLocaleDateString()}
                readOnly
              />
            </Form.Group>
            {quantity && <p>Total Value: ₹{(parseFloat(quantity) * currentNav).toFixed(2)}</p>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSellModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleSell} disabled={!quantity}>Sell</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MFDetails;