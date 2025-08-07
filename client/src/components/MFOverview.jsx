import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Spinner, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const MFOverview = () => {
  const [mfData, setMfData] = useState([]);
  const [latestNAVs, setLatestNAVs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3000/api/mfs")
      .then(res => {
        const allData = res.data;

        const latestByFund = {};
        allData.forEach(entry => {
          const date = dayjs(entry.nav_date);
          if (
            !latestByFund[entry.fund_name] ||
            dayjs(latestByFund[entry.fund_name].nav_date).isBefore(date)
          ) {
            latestByFund[entry.fund_name] = entry;
          }
        });

        const latestList = Object.values(latestByFund);
        setLatestNAVs(latestList);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching mutual fund data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center text-success">📊 Latest Mutual Fund NAVs</h2>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Card className="shadow-sm border">
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead className="bg-success text-white text-center">
                <tr>
                  <th>#</th>
                  <th>Mutual Fund</th>
                  <th>Latest NAV (₹)</th>
                  <th>As of Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {latestNAVs.map((mf, idx) => (
                  <tr key={mf.id || mf.fund_id}>
                    <td>{idx + 1}</td>
                    <td>{mf.fund_name}</td>
                    <td>₹ {parseFloat(mf.nav).toFixed(2)}</td>
                    <td>{dayjs(mf.nav_date).format("DD/MM/YYYY")}</td>

                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => navigate(`/mfs/${mf.id || mf.fund_id}`)}
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

export default MFOverview;
