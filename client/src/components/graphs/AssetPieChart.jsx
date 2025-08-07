import React from 'react';
import ReactApexChart from 'react-apexcharts';

const AssetPieChart = () => {
  const series = [60000, 40000, 20000, 15000]; // Example amounts
  const options = {
    chart: {
      type: 'pie',
    },
    labels: ['Stocks', 'Mutual Funds', 'Crypto', 'Gold'],
    title: {
      text: 'Investment Distribution by Asset Type',
      align: 'center'
    },
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return opts.w.config.labels[opts.seriesIndex] + ": ₹" + series[opts.seriesIndex];
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <ReactApexChart options={options} series={series} type="pie" height={350} />
    </div>
  );
};

export default AssetPieChart;
