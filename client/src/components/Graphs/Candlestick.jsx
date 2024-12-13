import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import Formatter from '../../utilities/Formatter';

export default function CandleStick({ data, option }) {
  const [options, setOptions] = useState({
    chart: {
      type: 'candlestick',
      height: 350,
      background: '#ffffff',
    },
    title: {
      text: 'CandleStick Chart',
      align: 'left',
    },
    xaxis: {
      type: 'category',
      categories: data.map((point) => point.x), 
      labels: {
        formatter: function (val) {
          const date = new Date(val);
          return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
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
  });

  useEffect(() => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      xaxis: {
        ...prevOptions.xaxis,
        labels: {
          ...prevOptions.xaxis.labels,
          formatter: function (val) {
            return Formatter(val, option);
          },
        },
      },
    }));
  }, [option, data]); 

  const series = [
    {
      data: data,
      name: 'Price',
      color: '#00005F',
    },
  ];

  return (
    <div>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="candlestick" height={350} />
      </div>
    </div>
  );
}
