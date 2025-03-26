import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';
import UsersAPI from '../services/UsersAPI';
import AuthAPI from '../services/AuthAPI';

export default function UpgradePremium({ setDataUser }) {

    const navigate = useNavigate();

    const handleUpgradePremium = async (e) => {
        e.preventDefault();
        UsersAPI.upgradePremium()
          .then(() => {
              alert('Upgrade successfully');
              navigate('/');
          })
          .then(() => {
              AuthAPI.authenticate()
                .then(data => {
                    setDataUser({username: data.username, fullname: data.fullname, group: data.group});
                })
                .catch(() => {
                    alert('Error authenticating: Upgrade failed');
                });
          })
          .catch(error => {
              alert('Error upgrading: ' + error.message);
          });
    };

    return (
        <div>
            <h2>Upgrade Premium</h2>
            <form onSubmit={handleUpgradePremium}>
                <button className="form-button" type="submit">Upgrade</button>
            </form>
        </div>
    );
}
