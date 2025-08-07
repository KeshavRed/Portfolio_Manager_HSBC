import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { Spinner } from "react-bootstrap";

const StockCharts = () => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3000/api/bar-data")
      .then(res => {
        console.log("Fetched Data:", res.data);
        setStockData(res.data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  if (loading) return <Spinner animation="border" />;

  // Custom colors for each stock
  const customColors = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
  ];

  const barOptions = {
    chart: { id: "bar-chart" },
    xaxis: { categories: stockData.categories },
    colors: customColors,
    plotOptions: {
      bar: {
        distributed: true, // enables different colors for each bar
        borderRadius: 4,
        horizontal: false
      }
    },
    dataLabels: {
      enabled: true
    }
  };

  const barSeries = stockData.series;

  return (
    <>
      <h3>Stock Quantity Bar Chart</h3>
      <Chart options={barOptions} series={barSeries} type="bar" width="700" />
    </>
  );
};

export default StockCharts;
