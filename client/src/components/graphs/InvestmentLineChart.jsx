import React from 'react';
import ReactApexChart from 'react-apexcharts';

const InvestmentLineChart = () => {
  const series = [
    {
      name: 'Stocks',
      data: [12000, 14000, 15000, 16000, 15500, 17000, 18000, 19000, 21000, 22000, 23000, 24000]
    },
    {
      name: 'Mutual Funds',
      data: [8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500]
    },
    {
      name: 'Crypto',
      data: [2000, 2500, 3000, 2800, 3500, 4000, 4500, 4800, 4700, 4900, 5000, 5200]
    },
    {
      name: 'Gold',
      data: [3000, 3200, 3400, 3600, 3800, 4000, 4200, 4400, 4600, 4800, 5000, 5200]
    }
  ];

  const options = {
    chart: {
      height: 350,
      type: 'line',
      zoom: { enabled: true }
    },
    title: {
      text: 'Investment Trends Over a Year',
      align: 'center'
    },
    xaxis: {
      categories: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
    },
    yaxis: {
      title: {
        text: 'Investment Value (₹)'
      }
    },
    markers: {
      size: 4
    },
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    tooltip: {
      shared: true,
      intersect: false
    },
    legend: {
      position: 'top'
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default InvestmentLineChart;
