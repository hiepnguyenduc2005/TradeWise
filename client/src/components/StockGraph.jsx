import React, { useState, useEffect } from 'react';
import ProfilesAPI from '../services/ProfilesAPI';
import Line from './Graphs/Line';
import Candlestick from './Graphs/Candlestick';
import HeikinAshi from './Graphs/HeikinAshi';
import Area from './Graphs/Area';
import '../css/Profile.css';

export default function StockGraph ({ symbol, ipoDate }) {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState('line'); 
  const [option, setOption] = useState('1d'); 

  useEffect(() => {
    const fetchStockData = async () => {
        ProfilesAPI.graph(symbol, option, ipoDate)
            .then(result => {
                setData(formatData(result.values.reverse()));
            })
            .catch(error => console.error("Error fetching stock data: ", error));
    };
    fetchStockData();
  }, [symbol, option]);

  const formatData = (rawData) => {
    return rawData.map((item) => ({
      x: new Date(item.datetime),
      y: [parseFloat(item.open), parseFloat(item.high),parseFloat(item.low), parseFloat(item.close)],
      volume: parseFloat(item.volume),
    }));
  };  

  const renderChart = () => {
    if (chartType === 'line') return <Line data={data} option={option} />;
    if (chartType === 'candlestick') return <Candlestick data={data} option={option} />;
    if (chartType === 'heikin-ashi') return <HeikinAshi data={data} option={option} />;
    if (chartType === 'area') return <Area data={data} option={option} />;
  };

  return (
    <div>
      <div className="chart-controls">
        <div className="chart-buttons">
          <button
            className={chartType === 'line' ? 'chart-button active' : 'chart-button'}
            onClick={() => setChartType('line')}
          >
            Line
          </button>
          <button
            className={chartType === 'candlestick' ? 'chart-button active' : 'chart-button'}
            onClick={() => setChartType('candlestick')}
          >
            Candlestick
          </button>
          <button
            className={chartType === 'heikin-ashi' ? 'chart-button active' : 'chart-button'}
            onClick={() => setChartType('heikin-ashi')}
          >
            Heikin-Ashi
          </button>
          <button
            className={chartType === 'area' ? 'chart-button active' : 'chart-button'}
            onClick={() => setChartType('area')}
          >
            Area
          </button>
        </div>
        <div className="chart-dropdown">
          <select
            className="chart-select"
            onChange={(e) => setOption(e.target.value)}
            value={option}
          >
            <option value="1d">1 Day</option>
            <option value="5d">5 Days</option>
            <option value="1m">1 Month</option>
            <option value="6m">6 Months</option>
            <option value="ytd">Year-to-Date</option>
            <option value="1y">1 Year</option>
            <option value="5y">5 Years</option>
            <option value="max">Max</option>
          </select>
        </div>
      </div>
      {renderChart()}
    </div>
  );
};
