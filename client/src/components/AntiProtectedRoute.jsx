import React from 'react';
import { Navigate } from 'react-router-dom';

function AntiProtectedRoute({ isAuthenticated, children }) {
    if (isAuthenticated) {
        return <Navigate to="/" />;
    }
    return children;
}

export default AntiProtectedRoute;
