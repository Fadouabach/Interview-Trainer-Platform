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
                const tokenRes = await axios.post('http://localhost:5002/api/auth/tokenIsValid', null, {
                    headers: { 'x-auth-token': currentToken }
                });

                if (tokenRes.data) {
                    const userRes = await axios.get('http://localhost:5002/api/auth/', {
                        headers: { 'x-auth-token': currentToken }
                    });
                    setUser(userRes.data);
                    setToken(currentToken);
                    localStorage.setItem('user-role', userRes.data.role || 'user');
                    localStorage.setItem('user-data', JSON.stringify(userRes.data));
                } else {
                    localStorage.setItem('auth-token', '');
                    localStorage.setItem('user-role', '');
                    localStorage.setItem('user-data', '');
                    setToken(null);
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth Check Error", err);
                localStorage.setItem('auth-token', '');
                localStorage.setItem('user-role', '');
                localStorage.setItem('user-data', '');
            }

            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const loginRes = await axios.post('http://localhost:5002/api/auth/login', { email, password });

            setUser(loginRes.data.user);
            setToken(loginRes.data.token);
            localStorage.setItem('auth-token', loginRes.data.token);
            localStorage.setItem('user-role', loginRes.data.user.role || 'user');
            localStorage.setItem('user-data', JSON.stringify(loginRes.data.user));
            return { success: true, user: loginRes.data.user };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.msg || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            // Check if userData is FormData (for expert registration with files)
            const isFormData = userData instanceof FormData;
            const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
            
            const res = await axios.post('http://localhost:5002/api/auth/register', userData, config);
            
            // Auto login after register
            // If it was FormData, we need to extract email/password for the login call
            // Alternatively, we can make the register route return the token like login does.
            // Let's check how login is called.
            if (isFormData) {
                return await login(userData.get('email'), userData.get('password'));
            }
            return await login(userData.email, userData.password);
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.msg || 'Registration failed'
            };
        }
    };

    const logout = () => {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Reset state
        setToken(null);
        setUser(null);

        // SECURE REDIRECT: Hard reload to the landing page
        // This clears all React memory state and prevents back-button data leaks
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
