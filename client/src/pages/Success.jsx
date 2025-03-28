import '../css/main.css';
import { useEffect } from 'react';
export default function Success() {
    useEffect(() => {
        setTimeout(() => {
            window.location.href = '/';
        }
        , 5000); 
    }, []); 
    return (
        <div className="content">
            <h2>Success</h2>
            <div className="not-found"></div>
            <p>Sucessfully Upgraded! Enjoy New Functions! Redirect to Dashboard now!</p>
        </div>
    );
}