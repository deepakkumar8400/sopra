// 1. Import React and its Hooks (useState, useEffect)
import React, { useEffect, useState } from 'react'; // <-- Corrected this line

// 2. Import Axios
import axios from 'axios';

// 3. Import useAuth hook
import { useAuth } from '../context/AuthContext';

// 4. Import Navbar component
import Navbar from '../components/Navbar';

// 5. Import Link component from react-router-dom
import { Link } from 'react-router-dom'; // <-- Corrected this line

const Dashboard = () => {
    const { user, logout, authToken } = useAuth();
    const [profile, setProfile] = useState(null);
    const [accountDetails, setAccountDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                };
                const profileRes = await axios.get('http://localhost:5000/profile', config);

                setProfile(profileRes.data.user);
                setAccountDetails(profileRes.data.account);

            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err.response?.data?.message || 'Failed to fetch user data.');
                if (err.response && err.response.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        if (user && authToken) {
            fetchUserData();
        } else if (!user && !authToken) {
             setLoading(false);
             setError("You need to be logged in to view the dashboard.");
        }
    }, [user, logout, authToken]);

    if (loading) return <div className="text-center mt-10">Loading dashboard...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!profile || !accountDetails) return <div className="text-center mt-10">Please log in or user data could not be loaded.</div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Welcome, {profile.username}!</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Account Balance Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-3">Account Balance</h2>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                            ₹{accountDetails.balance?.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Account No: {accountDetails.accountNumber}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
                        <ul className="space-y-2">
                            <li><Link to="/transfer" className="text-blue-600 hover:underline">Transfer Funds</Link></li>
                            <li><Link to="/transactions" className="text-blue-600 hover:underline">View Transactions</Link></li>
                            <li><Link to="/profile" className="text-blue-600 hover:underline">Manage Profile</Link></li>
                            <li><Link to="/kyc" className="text-blue-600 hover:underline">KYC Documents</Link></li>
                        </ul>
                    </div>

                    {/* KYC Status */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-3">KYC Status</h2>
                        <p className={`text-lg font-bold ${profile.kycStatus === 'approved' ? 'text-green-500' : profile.kycStatus === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                            {profile.kycStatus?.toUpperCase()}
                        </p>
                        {profile.kycStatus !== 'approved' && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Please complete your KYC to unlock full features. <Link to="/kyc" className="text-blue-600 hover:underline">Upload documents</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;