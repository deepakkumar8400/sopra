// client/src/pages/AuthPage.js (THIS CODE IS ALREADY GOOD, NO CHANGES NEEDED)
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import React from 'react';
import { Link } from 'react-router-dom'; // Ensure Link is imported

const AuthPage = ({ isRegister }) => {
    const { login, register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                if (!username) {
                    setError('Username is required for registration.');
                    setLoading(false);
                    return;
                }
                await register(username, email, password);
            } else {
                await login(email, password);
            }
        } catch (err) {
            // This line correctly captures the 'message' from your backend's 400 status responses
            setError(err.response?.data?.message || 'An unexpected error occurred. Please check network/server.');
            console.error('Auth error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
                    {isRegister ? 'Register' : 'Login'}
                </h2>
                {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required={isRegister}
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
                        </button>
                        {isRegister ? (
                            <Link to="/login" className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
                                Already have an account? Login
                            </Link>
                        ) : (
                            <Link to="/register" className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
                                Don't have an account? Register
                            </Link>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthPage;