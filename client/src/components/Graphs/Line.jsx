import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import Formatter from '../../utilities/Formatter'; 
import CalculateClose from '../../utilities/CalculateClose'; 

export default function Line({ data, option }) {
  const [lineData, setLineData] = useState([]);
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
      type: 'category',
      categories: lineData.map((point) => point.x),
      labels: {
        formatter: function (val) {
          const date = new Date(val);
          return date.toLocaleString('en-US', {
            day: 'numeric',
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
    stroke: {
      curve: 'smooth', 
      width: 2,
      colors: ['#00005F'], 
    },
    markers: {
        size: 0, 
        colors: ['#00005F'], 
        strokeWidth: 2, 
        hover: {
          size: 7, 
        },
    },
    tooltip: {
        enabled: true,
        marker: {
            fillColors: ['#00005F'], 
        },
    },
  });

  useEffect(() => {
    setLineData(CalculateClose(data));
  }, [data]);

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
  }, [option, lineData]);

  const series = [
    {
      data: lineData,
      name: 'Price',
      color: '#00005F',
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
