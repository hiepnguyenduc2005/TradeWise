import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';
import UsersAPI from '../services/UsersAPI';

export default function AddCash({setCash}) {
    const [amount, setAmount] = useState('');

    const navigate = useNavigate();

    const handleAddCash = async (e) => {
        e.preventDefault();
        if (amount === '') {
            alert('Please enter an amount');
            return;
        }
        else {
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount < 0) {
                alert('Cash added must be a non-negative number');
                return;
            }
        }
        
        UsersAPI.addCash(amount)
          .then(() => {
              alert('Cash added successfully');
              navigate('/');
          })
          .then(() => {
            UsersAPI.showCash()
              .then(data => setCash(data.balance))
              .catch(error => console.error('Error fetching cash:', error.message));
          })
          .catch((error) => {
              alert('Error adding cash: ' + error.message);
          });
    }

    return (
        <div>
            <h2>Add Cash</h2>
            <form onSubmit={handleAddCash}>
                <div className="form-item">
                    <label>Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <button className="form-button" type="submit">Add Cash</button>
            </form>
        </div>
    );
}
