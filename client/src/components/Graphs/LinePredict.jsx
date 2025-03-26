import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import Formatter from '../../utilities/Formatter'; 
import CalculateClose from '../../utilities/CalculateClose'; 

export default function LinePredict({ showData, predictData }) {
  const [showPrice, setShowPrice] = useState([]);
  const [predictPrice, setPredictPrice] = useState([]);
  const [options, setOptions] = useState({
    chart: {
      type: 'line',
      height: 350,
      background: '#FFFFFF',
    },
    title: {
      text: 'Line Chart',
      align: 'left',
    },
    xaxis: {
      type: 'datetime', 
      categories: [], 
      labels: {
        formatter: function (val) {
          const date = new Date(val);
          return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        },
        showDuplicates: false,
        style: {
          fontSize: '10px',
        },
      },
      tickAmount: 10,
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(2);
        },
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    markers: {
      size: 0,
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    tooltip: {
      enabled: true,
    },
  });

  useEffect(() => {
    const actualPrices = CalculateClose(showData);
    const predictedPrices = CalculateClose(predictData);

    setShowPrice(actualPrices);
    setPredictPrice(predictedPrices);

    const allDates = [
      ...showData.map((point) => new Date(point.x).getTime()),
      ...predictData.map((point) => new Date(point.x).getTime()),
    ];

    setOptions((prevOptions) => ({
      ...prevOptions,
      xaxis: {
        ...prevOptions.xaxis,
        type: 'datetime',
        categories: allDates,
        labels: {
          ...prevOptions.xaxis.labels,
          formatter: function (val) {
            return Formatter(val, '1m'); 
          },
        },
      },
    }));
  }, [showData, predictData]);

  const series = [
    {
      name: 'Actual',
      data: showData.map((point) => ({
        x: new Date(point.x).getTime(),
        y: point.y,
      })),
      color: '#00005F', 
    },
    {
      name: 'Prediction',
      data: predictData.map((point) => ({
        x: new Date(point.x).getTime(),
        y: point.y,
      })),
      color: '#FFBF69', 
    },
  ];

  return (
    <div>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="line" height={350} />
      </div>
    </div>
  );
}