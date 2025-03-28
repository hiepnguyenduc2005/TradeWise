import '../css/main.css';
import { useEffect } from 'react';
export default function Failure() {
    useEffect(() => {
        setTimeout(() => {
            window.location.href = '/';
        }
        , 5000); 
    }, []); 
    return (
        <div className="content">
            <h2>Failure</h2>
            <div className="not-found"></div>
            <p>Fail to Upgrade! Redirect to Dashboard now!</p>
        </div>
    );
}