import React, { useState, useEffect } from 'react';
import ProfilesAPI from '../services/ProfilesAPI';
import LinePredict from './Graphs/LinePredict';
import '../css/Profile.css';

export default function StockGraph ({ symbol, dataUser }) {
  const [showData, setShowData] = useState([]);
  const [predictData, setPredictData] = useState([]);
  const [showOption, setShowOption] = useState('1m'); 
  const [predictOption, setPredictOption] = useState('5d');
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);  
    try {
      const result = await ProfilesAPI.predict(symbol, predictOption, showOption);
      setShowData(formatData(result.showData.reverse()));
      setPredictData(formatPredictions(result.predictData));
    } catch (error) {
      console.error("Error fetching stock data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const formatData = (rawData) => {
    return rawData.map((item) => ({
      x: new Date(item.datetime),
      y: [parseFloat(item.open), parseFloat(item.high),parseFloat(item.low), parseFloat(item.close)],
      volume: parseFloat(item.volume),
    }));
  };  

  const formatPredictions = (rawData) => {
    return rawData.map((item) => ({
      x: new Date(item.datetime),
      y: [0.0, 0.0, 0.0, parseFloat(item.close)],
    }));
  };

  if (dataUser.group !== 'Premium User') {
    return (
      <div className="prediction-container">
        <div className="profile-text">
          <h5>Stock Predictions</h5> (Preminum Only)
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="prediction-container">
        <h5 className="prediction-label">Predictions</h5>
        <div className="predictions-options">
          <div className="chart-dropdowns">
            <label className="chart-label">Show Option</label>
            <select
              className="chart-select"
              onChange={(e) => setShowOption(e.target.value)}
              value={showOption}
            >
              <option value="1m">1 Month</option>
              <option value="6m">6 Months</option>
              <option value="ytd">Year-to-Date</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
          <div className="chart-dropdowns">
            <label className="chart-label">Predict Option</label>
            <select
              className="chart-select"
              onChange={(e) => setPredictOption(e.target.value)}
              value={predictOption}
            >
              <option value="5d">5 Days</option>
              <option value="1m">1 Month</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
          <button 
            className="predict-button" 
            onClick={handlePredict} 
            disabled={loading} 
          >
            {loading ? 'Loading...' : 'Predict'}
          </button>
        </div>
      </div>
      {showData.length && predictData.length ? (
        <LinePredict showData={showData} predictData={predictData} />
        // <div>done</div>
      ) : null}
    </div>
  );
  
};
