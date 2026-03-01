import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import RequestAccess from './pages/auth/RequestAccess';
import Pending from './pages/auth/Pending';

// Main Pages
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientPortal from './pages/ClientPortal';

// Workspaces
import DesignerWorkspace from './pages/workspaces/DesignerWorkspace';
import AnalystWorkspace from './pages/workspaces/AnalystWorkspace';
import QaWorkspace from './pages/workspaces/QaWorkspace';
import AiBuilderWorkspace from './pages/workspaces/AiBuilderWorkspace';
import IntegrationWorkspace from './pages/workspaces/IntegrationWorkspace';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <div style={{ backgroundColor: '#1E1E24', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/request-access" element={<RequestAccess />} />
                        <Route path="/pending" element={<Pending />} />

                        {/* Protected Routes (Require Active Status) */}
                        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/client" element={<ProtectedRoute><ClientPortal /></ProtectedRoute>} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

                        {/* Workspace Routes */}
                        <Route path="/workspaces/designer" element={<ProtectedRoute><DesignerWorkspace /></ProtectedRoute>} />
                        <Route path="/workspaces/analyst" element={<ProtectedRoute><AnalystWorkspace /></ProtectedRoute>} />
                        <Route path="/workspaces/qa" element={<ProtectedRoute><QaWorkspace /></ProtectedRoute>} />
                        <Route path="/workspaces/ai-builder" element={<ProtectedRoute><AiBuilderWorkspace /></ProtectedRoute>} />
                        <Route path="/workspaces/integration" element={<ProtectedRoute><IntegrationWorkspace /></ProtectedRoute>} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
