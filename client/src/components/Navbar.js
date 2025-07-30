// client/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import {useAuth}  from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth(); // Get isAuthenticated and logout from context

    return (
        <nav className="bg-blue-600 dark:bg-blue-800 p-4 text-white shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to={isAuthenticated ? "/dashboard" : "/"} className="text-2xl font-bold">Banking App</Link>
                <div>
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span>Welcome, {user?.username || user?.email}!</span>
                            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                            <Link to="/profile" className="hover:underline">Profile</Link>
                            {user?.role === 'admin' && ( // Show admin link only if admin
                                <Link to="/admin-dashboard" className="hover:underline">Admin</Link>
                            )}
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="hover:underline">Login</Link>
                            <Link to="/register" className="hover:underline">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;