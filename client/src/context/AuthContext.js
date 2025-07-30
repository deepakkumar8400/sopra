import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected import: now importing 'jwtDecode'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token); // Use jwtDecode here
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    setUser({ id: decoded.id, role: decoded.role }); // Store user data from token
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                // Handle invalid token (e.g., malformed or expired not caught by exp check)
                console.error("Error decoding token:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            const decoded = jwtDecode(res.data.token); // Use jwtDecode here
            setUser({ id: decoded.id, role: decoded.role, username: res.data.user.username });
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            navigate(decoded.role === 'admin' ? '/admin-dashboard' : '/dashboard');
        } catch (err) {
            console.error(err.response ? err.response.data.message : err.message);
            throw err; // Re-throw to handle in component
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
            localStorage.setItem('token', res.data.token);
            const decoded = jwtDecode(res.data.token); // Use jwtDecode here
            setUser({ id: decoded.id, role: decoded.role, username: res.data.user.username });
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            navigate('/dashboard');
        } catch (err) {
            console.error(err.response ? err.response.data.message : err.message);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);