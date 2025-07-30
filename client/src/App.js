// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Still good to keep AuthProvider for login/register functions

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import TransferFunds from './pages/TransferFunds';
import TransactionHistory from './pages/TransactionHistory';
import Unauthorized from './pages/Unauthorized';
import KYCUpload from './pages/KYCUpload';

function App() {
    return (
        <Router>
            <AuthProvider> {/* Keep AuthProvider to manage global auth state and functions */}
                <div className="App">
                    <Routes>
                        {/* Auth Routes */}
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/register" element={<AuthPage isRegister={true} />} />

                        {/* All other routes are now public/unprotected */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/transfer" element={<TransferFunds />} />
                        <Route path="/transactions" element={<TransactionHistory />} />
                        <Route path="/kyc" element={<KYCUpload />} />
                        <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* Admin dashboard also made public */}
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Default route */}
                        <Route path="/" element={<AuthPage />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;