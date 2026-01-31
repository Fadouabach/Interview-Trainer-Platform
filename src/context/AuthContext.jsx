import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('auth-token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            let currentToken = localStorage.getItem('auth-token');

            if (!currentToken) {
                localStorage.setItem('auth-token', '');
                currentToken = '';
                setLoading(false);
                return;
            }

            try {
                const tokenRes = await axios.post('http://localhost:5000/api/auth/tokenIsValid', null, {
                    headers: { 'x-auth-token': currentToken }
                });

                if (tokenRes.data) {
                    const userRes = await axios.get('http://localhost:5000/api/auth/', {
                        headers: { 'x-auth-token': currentToken }
                    });
                    setUser(userRes.data);
                    setToken(currentToken);
                } else {
                    localStorage.setItem('auth-token', '');
                    setToken(null);
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth Check Error", err);
                localStorage.setItem('auth-token', '');
            }

            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email, password });

            setUser(loginRes.data.user);
            setToken(loginRes.data.token);
            localStorage.setItem('auth-token', loginRes.data.token);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.msg || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            await axios.post('http://localhost:5000/api/auth/register', userData);
            // Auto login after register
            return await login(userData.email, userData.password);
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.msg || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.setItem('auth-token', '');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
