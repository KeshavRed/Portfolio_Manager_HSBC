import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Card, Spinner, Modal, Button } from "react-bootstrap";
import Chart from "react-apexcharts";
import PortfolioCards from './PortfolioCards';
import PortfolioInvestmentPie from './PortfolioInvestmentPie';

const PortfolioTable = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [goldPortfolio, setGoldPortfolio] = useState(null);
  const [mfPortfolio, setMfPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [currentDate] = useState(new Date().toLocaleDateString('en-GB'));

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const [stockRes, goldRes, mfRes] = await Promise.all([
          axios.get("http://localhost:3000/api/portfolio"),
          axios.get("http://localhost:3000/api/portfolioGold"),
          axios.get("http://localhost:3000/api/portfolio/mutualfunds"),
        ]);
 {/*new*/}
        setPortfolio(stockRes.data);
        setGoldPortfolio(goldRes.data);
        setMfPortfolio(mfRes.data.map(item => ({
          ...item,
          stock_name: item.fund_name
        })));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const totalStockValue = portfolio.reduce(
    (acc, item) => acc + item.current_price * parseFloat(item.available_quantity),
    0
  );



  



  const totalStockProfitLoss = portfolio.reduce(
    (acc, item) => acc + parseFloat(item.profit_loss || 0),
    0
  );

  const cardTabs = [
    { title: "Stock", icon: "📈", key: "stock", bg: "#e8f4fd" },
    { title: "Gold", icon: "🥇", key: "gold", bg: "#e8f4fd" },
    { title: "Mutual Fund", icon: "📂", key: "mf", bg: "#e8f4fd" },
  ];

  const totalMfValue = mfPortfolio.reduce(
    (acc, item) => acc + item.current_price * parseFloat(item.available_quantity),
    0
  );

  const totalMfProfitLoss = mfPortfolio.reduce(
    (acc, item) => acc + parseFloat(item.profit_loss || 0),
    0
  );

  const totalGoldValue = goldPortfolio ? parseFloat(goldPortfolio.current_value) : 0;
  const totalGoldProfitLoss = goldPortfolio
    ? parseFloat(goldPortfolio.profit_loss || 0)
    : 0;

  const totalValue = totalStockValue + totalGoldValue + totalMfValue;
  const totalProfitLoss = totalStockProfitLoss + totalGoldProfitLoss + totalMfProfitLoss;

  const barOptions = {
    chart: { type: "bar" },
    xaxis: {
      categories: [
        ...portfolio.map((item) => item.stock_name), 
        ...mfPortfolio.map((item) => item.stock_name),
        "Gold"
      ],
    },
    colors: [
      ...portfolio.map((item) =>
        parseFloat(item.profit_loss || 0) >= 0 ? "#198754" : "#dc3545"
      ),
      ...mfPortfolio.map((item) =>
        parseFloat(item.profit_loss || 0) >= 0 ? "#198754" : "#dc3545"
      ),
      totalGoldProfitLoss >= 0 ? "#198754" : "#dc3545",
    ],
    plotOptions: {
      bar: {
        distributed: true,
        horizontal: false,
        columnWidth: "60%",
      },
    },
    dataLabels: { enabled: false },
  };

  const barSeries = [
    {
      name: "Profit/Loss",
      data: [
        ...portfolio.map((item) => parseFloat(item.profit_loss || 0)),
        ...mfPortfolio.map((item) => parseFloat(item.profit_loss || 0)),
        parseFloat(totalGoldProfitLoss),
      ],
    },
  ];

  const handleClose = () => setActiveTab(null);

  if (loading) return <Spinner animation="border" variant="primary" />;

  return (
    <div className="container">
    
        <div style={{ marginTop: "90px", textAlign: "left" }}>
        <h4
          style={{
            fontSize: "38px",
            color: "#0084da",
            paddingRight: "40px",
            marginBottom: "30px",
            marginTop: "20px",
          }}
        >
          <strong>Portfolio Value ({currentDate}):</strong> ₹{totalValue.toFixed(2)}<br />
        </h4>
      </div>
      <div className="row">
        <div className="col-md-8 mt-6">

          <PortfolioInvestmentPie />
        </div>

        <div className="col-md-4">
          <div className="d-flex flex-wrap justify-content-center gap-4 mb-4 mt-4">
            {cardTabs.map((item, index) => (
              <Card
                key={index}
                onClick={() => setActiveTab(item.key)}
                style={{
                  width: '20rem',
                  height: '10rem',
                  background: item.bg,
                  border: activeTab === item.key ? '3px solid #0084da' : 'none',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: activeTab === item.key
                    ? '0 6px 16px rgba(0, 132, 218, 0.3)'
                    : '0 4px 12px rgba(0, 132, 218, 0.1)',
                  cursor: 'pointer',
                  marginTop: 'px',
                  
                }}
                className="p-3 shadow-sm rounded-4"
              >
                <Card.Body
                >
                  <Card.Title
                    style={{
                      fontSize: "1.6rem",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: "600",
              
                     
                    }}
                  >
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
                      <div style={{ color: '#0084da' }}>{item.icon}</div>
                    </div>
                    {item.title}
                  </Card.Title>
                  <Card.Text style={{ fontSize: "20px", color: "#333" }}>
                    View your {item.title.toLowerCase()} portfolio.
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Section */}
      <Modal size="xl" show={!!activeTab} onHide={handleClose} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            {activeTab === "stock" && "📋 Stock Portfolio"}
            {activeTab === "gold" && "🥇 Gold Portfolio"}
            {activeTab === "mf" && "📂 Mutual Fund Portfolio"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeTab === "stock" && (
            <>
              <Card className="p-3 mb-4 shadow-sm rounded-4 w-full">
                <Table bordered responsive>
                  <thead className="table-dark text-center">
                    <tr>
                      <th>Stock</th>
                      <th>Quantity</th>
                      <th>Current Price</th>
                      <th>Profit / Loss</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {portfolio.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.stock_name}</td>
                        <td>{parseFloat(item.available_quantity)}</td>
                        <td>₹{parseFloat(item.current_price).toFixed(2)}</td>
                       
                        <td className={parseFloat(item.profit_loss || 0) >= 0 ? "text-success" : "text-danger"}>
                          ₹{parseFloat(item.profit_loss || 0).toFixed(2)}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
              <Card className="p-3 mb-4 shadow-sm rounded-4">
                <h5 className="mb-3">📈 Stock Distribution by Quantity</h5>
                <Chart
                  options={{
                    labels: portfolio.map((item) => item.stock_name),
                    legend: { position: "bottom" },
                  }}
                  series={portfolio.map((item) => parseFloat(item.available_quantity))}
                  type="pie"
                  width="100%"
                  height={300}
                />
              </Card>
            </>
          )}

          {activeTab === "gold" && goldPortfolio && (
            <>
              <Card className="p-3 mb-4 shadow-sm rounded-4 w-full">
                <Table bordered responsive>
                  <thead className="table-warning text-center">
                    <tr>
                      <th>Asset</th>
                      <th>Quantity (g)</th>
                      <th>Current Price (₹/g)</th>
                      <th>Current Value (₹)</th>
                      <th>Net Investment (₹)</th>
                      <th>Profit / Loss (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    <tr>
                      <td>{goldPortfolio.asset}</td>
                      <td>{parseFloat(goldPortfolio.available_quantity)}</td>
                      <td>₹{parseFloat(goldPortfolio.current_price).toFixed(2)}</td>
                      <td>₹{parseFloat(goldPortfolio.current_value).toFixed(2)}</td>
                      <td>₹{parseFloat(goldPortfolio.net_investment).toFixed(2)}</td>
                      <td className={totalGoldProfitLoss >= 0 ? "text-success" : "text-danger"}>
                        ₹{totalGoldProfitLoss.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
              <div style={{ display: "flex", width: "100%", gap: "20px" }}>
                <Card
                  className="p-3 shadow-sm rounded-2"
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <h3 className="mb-2">🥇 Gold Holdings</h3>
                  <h1>{parseFloat(goldPortfolio.available_quantity)} g</h1>
                  <h4 className="text-muted">
                    Current Value: ₹
                    {parseFloat(
                      goldPortfolio.current_price * goldPortfolio.available_quantity
                    ).toFixed(2)}
                  </h4>
                </Card>

                <Card className="p-3 shadow-sm rounded-2" style={{ flex: 1 }}>
                  <h5 className="mb-3">📈 Distribution</h5>
                  <Chart
                    options={{
                      chart: { type: "bar" },
                      xaxis: { categories: ["Gold"] },
                      plotOptions: {
                        bar: {
                          columnWidth: "20%",
                          borderRadius: 5,
                        },
                      },
                    }}
                    series={[
                      {
                        name: "Quantity (g)",
                        data: [parseFloat(goldPortfolio.available_quantity)],
                      },
                    ]}
                    type="bar"
                    height={200}
                  />
                </Card>
              </div>
            </>
          )}

          {activeTab === "mf" && (
            <>
              {mfPortfolio.length > 0 ? (
                <>
                  <Card className="p-3 mb-4 shadow-sm rounded-4 w-full">
                    <Table bordered responsive>
                      <thead className="table-primary text-center">
                        <tr>
                          <th>Mutual Fund</th>
                          <th>Units</th>
                          <th>Current NAV</th>
                          <th>Profit / Loss</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {mfPortfolio.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.stock_name}</td>
                            <td>{parseFloat(item.available_quantity).toFixed(2)}</td>
                            <td>₹{parseFloat(item.current_price).toFixed(2)}</td>
                            <td className={parseFloat(item.profit_loss || 0) >= 0 ? "text-success" : "text-danger"}>
                              ₹{parseFloat(item.profit_loss || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card>
                  <Card className="p-3 mb-4 shadow-sm rounded-4">
                    <h5 className="mb-3">📂 Mutual Fund Distribution by Units</h5>
                    <Chart
                      options={{
                        labels: mfPortfolio.map((item) => item.stock_name),
                        legend: { position: "bottom" },
                      }}
                      series={mfPortfolio.map((item) => parseFloat(item.available_quantity))}
                      type="pie"
                      width="100%"
                      height={300}
                    />
                  </Card>
                </>
              ) : (
                <Card className="p-4 shadow-sm rounded-4 w-full text-center">
                  <p className="text-muted">No Mutual Fund investments found.</p>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PortfolioTable;