import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  console.log('AuthProvider useEffect', { token, userData });
  if (token && userData) {
    setUser(JSON.parse(userData));
    setIsAuthenticated(true);
  }
  setLoading(false);
  }, []);


  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);

      if (response.access && response.user) {
        const userData = {
          id: response.user.id.toString(),
          name: response.user.username,
          email: response.user.email,
          avatar: response.user.profile?.avatar || undefined,
          joinDate: response.user.date_joined
        };

        localStorage.setItem('authToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('userData in login', userData);
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await apiService.register({ name, email, password });

      if (response.access && response.user) {
        const userData = {
          id: response.user.id.toString(),
          name: response.user.username,
          email: response.user.email,
          avatar: response.user.profile?.avatar || undefined,
          joinDate: response.user.date_joined
        };

        localStorage.setItem('authToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('userData in signup', userData);
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    apiService.logout().catch(console.error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (data) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  return (
  <AuthContext.Provider value={{
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile
  }}>
    {loading ? <div className="text-white p-4">Loading...</div> : children}
  </AuthContext.Provider>
);

}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
