import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';
import AuthAPI from '../services/AuthAPI';

export default function Login({ setIsAuthenticated, setDataUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (username === '' || password === '') {
            alert('Please fill in all fields');
            return;
        }
        AuthAPI.loginUser(username, password)
            .then(() => {
                setIsAuthenticated(true);
            })
            .then(() => {
                AuthAPI.authenticate()
                    .then(data => {
                        setDataUser({ username: data.username, fullname: data.fullname, group: data.group });
                        navigate('/');
                    })
            })
            .catch((error) => {
                alert('Error authenticating: ' + error.message);
            });
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-item">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-item">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <p>Don't have an account yet? <a href="/signup">Create an account</a></p>
                <button className="form-button" type="submit">Login</button>
            </form>
        </div>
    );
}