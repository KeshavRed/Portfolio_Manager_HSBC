import React from "react";
import ReactApexChart from "react-apexcharts";

const AssetBarChart = () => {
  const series = [
    {
      name: "Invested Amount",
      data: [100000, 50000, 30000], // stocks, mutual, gold
    },
    {
      name: "Current Value",
      data: [120000, 45000, 28000],
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: 250,
      width: 1400,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#AFDBF5", ({ value, seriesIndex, dataPointIndex, w }) => {
      const invested = w.config.series[0].data[dataPointIndex];
      const current = w.config.series[1].data[dataPointIndex];
      return current >= invested ? "#0084da" : "#FF9149";
    }],
    xaxis: {
      categories: ["Stocks", "Mutual Funds", "Gold"],
    },
    legend: {
      position: "top",
    },
    title: {
      text: "Asset Comparison: Investment vs Value",
      align: "center",
      style: {
        fontSize: "20px",
      },
    },
  };

  return (
    <div style={{ width: "80vw", overflowX: "auto",}}> 
      <div style={{ minWidth: "100px" }}>
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={400}
        />
      </div>
    </div>
  );
};

export default AssetBarChart;