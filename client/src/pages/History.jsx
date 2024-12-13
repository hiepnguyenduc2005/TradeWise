import React, { useEffect, useState } from 'react';
import '../css/main.css';
import UsersAPI from '../services/UsersAPI';

export default function History() {
    const [transactions, setTransactions] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const [search, setSearch] = useState('');

    const loadMore = () => {
        setVisibleCount(prevCount => prevCount + 10); 
    };

    useEffect(() => {
        UsersAPI.history()
            .then(data => setTransactions(data.reverse()))
            .catch(error => console.error('Error fetching history:', error.message));
    }, []);

    return (
        <div className="history-container">
            <h2>History</h2>
            <form>
                <div className="form-item">
                    <label>Search by Symbol</label>
                    <input
                        type="text"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                    />
                </div>
            </form>
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Shares</th>
                        <th>Price</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions
                        .filter(transaction => transaction.symbol.toLowerCase().includes(search.toLowerCase()))
                        .slice(0, visibleCount)
                        .map((transaction, index) => (
                            <tr key={index}>
                                <td>{transaction.symbol}</td>
                                <td>{transaction.shares}</td>
                                <td>${transaction.price.toFixed(2)}</td>
                                <td>{new Date(transaction.time).toLocaleString()}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
            {(visibleCount < transactions.length) ? (
                <button onClick={loadMore} className="guide-button">Load More ...</button>
            ) : (
                <p className="no-more-text">No more transactions to show.</p>
            )}
        </div>
    );
}
