import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';
import TransactionsAPI from '../services/TransactionsAPI';

export default function Buy() {
    const [symbol, setSymbol] = useState('');
    const [shares, setShares] = useState('');

    const navigate = useNavigate();

    const handleBuyShares = async (e) => {
        e.preventDefault();
        if (symbol === '' || shares === '') {
            alert('Please enter both symbol and shares');
            return;
        } else {
            const parsedShares = parseInt(shares, 10);
            if (isNaN(parsedShares) || parsedShares <= 0) {
                alert('Shares must be a positive integer');
                return;
            }
        }

        TransactionsAPI.buy(symbol, shares)
            .then(() => {
                alert('Stock bought successfully');
                navigate('/');
            })
            .catch((error) => {
                alert('Error fetching stock data: ' + error.message);
            });
    };

    return (
        <div>
            <h2>Buy</h2>
            <form onSubmit={handleBuyShares}>
                <div className="form-item">
                    <label>Symbol</label>
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                    />
                </div>
                <div className="form-item">
                    <label>Shares</label>
                    <input
                        type="number"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                    />
                </div>
                <button className="form-button" type="submit">Buy</button>
            </form>
        </div>
    );
}
