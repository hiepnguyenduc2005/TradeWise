import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';
import AuthAPI from '../services/AuthAPI';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (currentPassword === '' || newPassword === '' || confirmPassword === '') {
            alert('Please fill in all fields');
        }
        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match');
            return;
        }
        
        AuthAPI.changePassword(currentPassword, newPassword)
          .then(() => {
              alert('Password changed successfully');
              navigate('/');
          })
          .catch(error => {
              alert('Error authenticating: ' + error.message);
          });
    };

    return (
        <div>
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword}>
                <div className="form-item">
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
                <div className="form-item">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="form-item">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button className="form-button" type="submit">Change Password</button>
            </form>
        </div>
    );
}
