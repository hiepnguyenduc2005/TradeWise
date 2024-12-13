import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/Profile.css';
import ProfilesAPI from '../services/ProfilesAPI';
import StockGraph from '../components/StockGraph';
import About from '../components/About';
import NewsData from '../components/NewsData';

export default function Profile() {
    let { symbol } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [price, setPrice] = useState(null);
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (symbol === '') {
                alert('Please enter a symbol');
                return;
            }

            ProfilesAPI.quote(symbol)
                .then(quoteData => {
                    setPrice(quoteData);
                    return ProfilesAPI.profile(symbol);
                })
                .then(profileData => {
                    setCompany(profileData.company);
                    setNews(profileData.news);
                })
                .catch(error => {
                    console.error('Error fetching stock data:', error.message);
                    navigate('/invalidSymbol');
                });          
        };

        fetchData();
    }, [symbol]);

    return (
        <div>
        {company && price && (
            <div>
                <h2>Profile</h2>
                <div className="profile">
                    <div className="profile-row">
                        <div>
                            <h4 className="profile-title">{company.companyName}</h4>
                            <p className="profile-subtitle">{symbol} | NASDAQ</p>
                            <p className="profile-quote">
                                $ <b className="profile-price">{price.price}</b>&nbsp;&nbsp;&nbsp;
                                <span className={`profile-change ${company.changes >= 0 ? 'positive' : 'negative'}`}>{price.change} ({price.percent_change}%)</span>
                                &nbsp;&nbsp;&nbsp;Market is now <b>{price.is_market_open ? 'Open' : 'Closed'}</b>
                            </p>
                        </div>
                        <div className="profile-logo">
                            <img className="profile-image" src={company.image} alt="Company Logo" />
                        </div>
                    </div>
                    <h5 className="profile-section">Historical Prices</h5>
                    <StockGraph symbol={symbol} ipoDate={company.ipoDate} />
                    <div className="profile-middle">
                        <button className="profile-button" onClick={() => navigate('/quote')}>Get Another Quote</button>
                    </div>
                    <h5 className="profile-section">About</h5>
                    <About company={company} price={price}/>
                    <h5 className="profile-section">News</h5>
                    <NewsData news={news} />
                </div>
            </div>
        )}
        </div>
    );
}
    