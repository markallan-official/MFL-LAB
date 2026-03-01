import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { user, loading, isAdmin, status } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ backgroundColor: '#1E1E24', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#A0A0A0' }}>
                <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                    Initializing Matrix...
                </div>
            </div>
        );
    }

    if (!user) {
        // Not logged in
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Super Admin Bypass
    const isSuper = user.email?.toLowerCase() === 'markmallan01@gmail.com' || isAdmin;

    if (requireAdmin && !isSuper) {
        return <Navigate to="/" replace />;
    }

    // Role-based status checks for non-admins
    if (!isSuper) {
        if (status === 'pending') {
            return <Navigate to="/pending" replace />;
        }
        if (status === 'rejected') {
            return (
                <div style={{ backgroundColor: '#1E1E24', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                    <h1 style={{ color: '#FF3333' }}>Access Denied</h1>
                    <p>Your request to join the platform was rejected by the administrator.</p>
                </div>
            );
        }
        if (!status || !status.startsWith('active')) {
            return <Navigate to="/pending" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
