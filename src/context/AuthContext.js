import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Configure axios defaults
  axios.defaults.baseURL = 'https://nikita.diplomcomtehno.online/api/';
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  }

  // Check if user is authenticated on load
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/profiles/me/');
      setCurrentUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/login/', { username, password });
      const { token } = response.data;
      
      setToken(token);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.non_field_errors?.[0] || 'Login failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      await axios.post('/register/', userData);
      
      // After registration, log the user in
      return await login(userData.username, userData.password);
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response?.data) {
        // Format validation errors
        const validationErrors = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${value.join(', ')}`)
          .join('\n');
        setError(validationErrors || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken('');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.patch(`/profiles/${currentUser.id}/`, profileData);
      setCurrentUser({...currentUser, ...response.data});
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      setError('Failed to update profile. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 