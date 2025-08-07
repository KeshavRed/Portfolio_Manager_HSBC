import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import { Card, Spinner } from 'react-bootstrap';

const InvestmentBarChart = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Stocks', 'Gold', 'Mutual Funds'];

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/investment-distribution');
        const { stocks, gold, mutualFunds } = res.data;

        const cleanedSeries = [
          parseFloat(stocks) || 0,
          parseFloat(gold) || 0,
          parseFloat(mutualFunds) || 0,
        ];

        setSeries([
          {
            name: 'Investment',
            data: cleanedSeries,
          },
        ]);
      } catch (err) {
        console.error('Error fetching investment data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentData();
  }, []);

  const options = {
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#2563eb',
          fontSize: '14px',
        },
      },
    },
    colors: ['#60a5fa'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '50%',
      },
    },
    dataLabels: {
      enabled: true,
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-4">
      <Card className="p-2 shadow-sm rounded-4 w-full max-w-4xl mb-4">
        
        {loading ? (
          <div className="text-center text-muted">
            <Spinner animation="border" variant="primary" size="sm" className="me-2" />
            Loading...
          </div>
        ) : (
          <div className="d-flex justify-content-center">
            <Chart options={options} series={series} type="bar" width={700} height={500} />
          </div>
          
          
        )}
        <h6 className="text-center">Investment Distribution</h6>

      </Card>
    </div>
  );
};

export default InvestmentBarChart;
