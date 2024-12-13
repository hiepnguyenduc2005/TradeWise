import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';

export default function Quote() {
    const [symbol, setSymbol] = useState('');
    const navigate = useNavigate();
    const getProfile = (e) => {
        e.preventDefault();
        if (symbol === '') {
            alert('Please fill in all fields');
            return;
        }
        navigate(`/quote/${symbol}`);
    }
    return (
        <div>
            <h2>Quote</h2>
                <form onSubmit={getProfile}>
                <div className="form-item">
                    <label>Symbol</label>
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                    />
                </div>
                <button className="form-button" type="submit">Quote</button>
            </form>
        </div>
    );
}
