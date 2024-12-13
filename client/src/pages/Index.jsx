import { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../css/main.css';
import { Link } from 'react-router-dom';
import UsersAPI from '../services/UsersAPI';

export default function Index({ isAuthenticated, cash }) {
    const [guideNeeded, setGuideNeeded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);
    const [transactions, setTransactions] = useState([]);

    const loadMore = () => {
        setVisibleCount(prevCount => prevCount + 10); 
    };

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        UsersAPI.profile()
            .then(data => {
                if (Array.isArray(data)) {
                    setTransactions(data.reverse())
                }
            })
            .catch(error => console.error('Error fetching transactions:', error.message));
    }, []);

    return (
        <div className="content">
            <Row>
                <Col>
                    <h2>TradeWise</h2>
                    <p>Comprehensive <b><i>Stock Portfolio</i></b> Management Platform</p>
                </Col>
                {isAuthenticated && (
                    <Col className="guide">
                        <button className="guide-button" onClick={() => setGuideNeeded(!guideNeeded)}>{guideNeeded ? 'Hide' : 'Show'} Guidance</button>
                    </Col>
                )}
            </Row>

            {isAuthenticated && (
                <div className="summary">
                    <h4>Summary</h4>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Shares</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.slice(0, visibleCount)
                                .map((transaction, index) => (
                                    <tr key={index}>
                                        <td><Link to={`/quote/${transaction.symbol}`} className="table-link">{transaction.symbol}</Link></td>
                                        <td>{transaction.shares}</td>
                                        <td>
                                            {transaction.price !== undefined ? `$${(transaction.price * 1).toFixed(2)}` : 'Loading...'}
                                        </td>
                                        <td>
                                            {transaction.price !== undefined ? `$${(transaction.price * transaction.shares).toFixed(2)}` : 'Loading...'}
                                        </td>
                                    </tr>
                                ))}
                            <tr>
                                <td colSpan="3">Cash</td>
                                <td>{cash !== undefined ? `$${(cash * 1).toFixed(2)}` : 'Loading...'}</td>
                            </tr>
                            <tr>
                                <td colSpan="3"><b>TOTAL</b></td>
                                <td><b>
                                    {cash !== undefined
                                        ? `$${(transactions.reduce((acc, transaction) => acc + (transaction.price * transaction.shares), 0) + cash).toFixed(2)}`
                                        : 'Loading...'}
                                </b>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {(visibleCount < transactions.length) ? (
                        <button onClick={loadMore} className="guide-button">Load More ...</button>
                    ) : (
                        <p className="no-more-text">No more symbols to show.</p>
                    )}
                </div>
            )}

            {((guideNeeded && isAuthenticated) || (!isAuthenticated)) && (
                <div className="features">
                    {isAuthenticated && <h4>Guidance</h4>}
                    <Row>
                        <Col className="feature">
                            <div className="feature-title">Real-Time Stock Quotes</div>
                            <p className="feature-content feature-2">Access instant stock prices from Twelve Data to make informed decisions.
                            </p>
                        </Col>
                        <Col className="feature">
                            <div className="feature-title">Transaction Tracking and Cash Management</div>
                            <p className="feature-content feature-1">Track your transactions and manage your finances effectively to keep your account current.</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="feature">
                            <div className="feature-title">Historical Data Visualization</div>
                            <p className="feature-content feature-1">Visualize stock trends with ApexCharts to simplify complex data into clear insights.</p>
                        </Col>
                        <Col className="feature">
                            <div className="feature-title">Automated News Scraping</div>
                            <p className="feature-content feature-2">Stay updated with the latest financial news and market trends automatically from NewsAPI.</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="feature">
                            <div className="feature-title">Deep Learning-Based Stock Predictions <i>(In Progress)</i></div>
                            <p className="feature-content feature-2">Use LSTM models to predict stock movements and enhance your investment strategies.</p>
                        </Col>
                        <Col className="feature">
                            <div className="feature-title">Personalized Investment Consulting</div>
                            <p className="feature-content feature-1">Consult our chatbot for personalized investment advice anytime, enhancing your market understanding.</p>
                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
}