import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../css/main.css';
import AuthAPI from '../services/AuthAPI';
import UsersAPI from '../services/UsersAPI';

export default function Signup({ setIsAuthenticated, setDataUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [cfPassword, setCfPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [balance, setBalance] = useState('');

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (username === '' || password === '' || cfPassword === '' || email === '' || firstName === '' || lastName === '' || balance === '') {
            alert('Please fill in all fields');
        }
        if (password !== cfPassword) {
            alert('Passwords do not match');
            return;
        }
        const parsedBalance = parseFloat(balance);
        if (isNaN(parsedBalance) || parsedBalance < 0) {
            alert('Balance must be a non-negative number');
            return;
        }
        AuthAPI.signupUser(username, password, email, firstName, lastName, parsedBalance)
            .then((data) => {
                setIsAuthenticated(true);
                setDataUser({ username: data.username, fullname: data.fullname });
                navigate('/');
            })
            .catch((error) => {
                alert('Error authenticating: ' + error.message);
            });
    }

    return (
        <div>
            <h2>Sign up</h2>
            <form onSubmit={handleSignup}>
                <div className="form-item">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <Row>
                    <Col>
                        <div className="form-item">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div className="form-item">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="form-item">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div className="form-item">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={cfPassword}
                                onChange={(e) => setCfPassword(e.target.value)}
                            />
                        </div>
                    </Col>
                </Row>
                <div className="form-item">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-item">
                    <label>Balance</label>
                    <input
                        type="number"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                    />
                </div>
                <p>Already have an account? <a href="/login">Sign in</a></p>
                <button className="form-button" type="submit">Sign Up</button>
            </form>
        </div>
    );
}