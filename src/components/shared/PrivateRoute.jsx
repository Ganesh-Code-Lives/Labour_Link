import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FullPageLoader from '../ui/FullPageLoader';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { currentUser, userRole, loading } = useContext(AuthContext);

    if (loading) {
        return <FullPageLoader message="Verifying session..." />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (userRole === 'pending' && window.location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    if (userRole !== 'pending' && window.location.pathname === '/onboarding') {
        switch (userRole) {
            case 'customer': return <Navigate to="/customer" replace />;
            case 'labourer': return <Navigate to="/labourer" replace />;
            case 'admin': return <Navigate to="/admin" replace />;
            default: return <Navigate to="/" replace />;
        }
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // If the user's role doesn't match the route requirements, redirect to their role-specific dashboard
        switch (userRole) {
            case 'pending': return <Navigate to="/onboarding" replace />;
            case 'customer': return <Navigate to="/customer" replace />;
            case 'labourer': return <Navigate to="/labourer" replace />;
            case 'admin': return <Navigate to="/admin" replace />;
            default: return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
