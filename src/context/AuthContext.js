import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (loginId, password) => {
    try {
      const response = await api.post('/api/v1/users/login', { login_id: loginId, Password: password });
      console.log('AuthContext: Login response:', response.data);
      const { success, message, data } = response.data;
      if (!success || !data) {
        return { success: false, message: message || 'Invalid response from server' };
      }

      const { access_token, refresh_token, ...userData } = data;
      if (!access_token || !userData.UserID) {
        return { success: false, message: 'Invalid user data received' };
      }
      console.log('AuthContext: User data:', userData);

      await AsyncStorage.setItem('accessToken', access_token);
      await AsyncStorage.setItem('refreshToken', refresh_token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      const userWithToken = { ...userData, access_token };
      setUser(userWithToken);

      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log('AuthContext: AsyncStorage contents:', { userData, accessToken });

        if (userData && accessToken) {
          let parsedUser;
          try {
            parsedUser = JSON.parse(userData);
          } catch (error) {
            console.error('AuthContext: Failed to parse userData:', error);
            await AsyncStorage.removeItem('userData');
            setIsLoading(false);
            return;
          }
          if (parsedUser.UserID) {
            parsedUser.access_token = accessToken;
            console.log('AuthContext: Parsed user data:', Object.keys(parsedUser));
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};