import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const response = await apiService.getUserProfile();
          const parsedUserData = JSON.parse(userData);
          
          if (parsedUserData.avatar && !parsedUserData.avatar.startsWith('http')) {
            parsedUserData.avatar = `http://localhost:8000${parsedUserData.avatar}`;
          }
          
          setUser(parsedUserData);
          setIsAuthenticated(true);
          
          if (window.location.pathname === '/') {
            window.location.href = '/home';
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
      setAuthChecked(true);
    };

    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);

      if (response.access && response.user) {
        const userData = {
          id: response.user.id.toString(),
          username: response.user.username,
          email: response.user.email,
          avatar: response.user.avatar ? `http://localhost:8000${response.user.avatar}` : undefined,
          joinDate: response.user.date_joined
        };

        localStorage.setItem('authToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        window.location.href = '/home';
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await apiService.register({ username, email, password });

      if (response.access && response.user) {
        const userData = {
          id: response.user.id.toString(),
          username: response.user.username,
          email: response.user.email,
          avatar: response.user.avatar ? `http://localhost:8000${response.user.avatar}` : undefined,
          joinDate: response.user.date_joined
        };

        localStorage.setItem('authToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        window.location.href = '/home';
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.fieldErrors) {
        const fieldErrors = error.fieldErrors;
        let errorMessage = '';
        
        if (fieldErrors.username) {
          if (Array.isArray(fieldErrors.username)) {
            errorMessage = fieldErrors.username[0];
          } else {
            errorMessage = fieldErrors.username;
          }
        }
        else if (fieldErrors.email) {
          if (Array.isArray(fieldErrors.email)) {
            errorMessage = fieldErrors.email[0];
          } else {
            errorMessage = fieldErrors.email;
          }
        }
        else if (fieldErrors.password) {
          if (Array.isArray(fieldErrors.password)) {
            errorMessage = fieldErrors.password[0];
          } else {
            errorMessage = fieldErrors.password;
          }
        }
        else if (fieldErrors.non_field_errors) {
          if (Array.isArray(fieldErrors.non_field_errors)) {
            errorMessage = fieldErrors.non_field_errors[0];
          } else {
            errorMessage = fieldErrors.non_field_errors;
          }
        }
        else {
          errorMessage = error.message || 'Registration failed';
        }
        
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    apiService.logout().catch(console.error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
  };

  const refreshToken = async () => {
    try {
      const response = await apiService.refreshToken();
      localStorage.setItem('authToken', response.access);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const checkAuth = () => {
    return isAuthenticated && user !== null;
  };

  const updateProfile = async (data) => {
    try {
      const response = await apiService.updateProfile(data);
      
      if (response.user) {
        const userData = {
          id: response.user.id.toString(),
          username: response.user.username,
          email: response.user.email,
          avatar: response.user.avatar ? `http://localhost:8000${response.user.avatar}` : undefined,
          joinDate: response.user.date_joined
        };

        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        return { success: true, message: 'Profile updated successfully' };
      }
      return { success: false, error: 'Profile update failed' };
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.fieldErrors) {
        const fieldErrors = error.fieldErrors;
        let errorMessage = '';
        
        if (fieldErrors.username) {
          if (Array.isArray(fieldErrors.username)) {
            errorMessage = fieldErrors.username[0];
          } else {
            errorMessage = fieldErrors.username;
          }
        }
        else if (fieldErrors.email) {
          if (Array.isArray(fieldErrors.email)) {
            errorMessage = fieldErrors.email[0];
          } else {
            errorMessage = fieldErrors.email;
          }
        }
        else if (fieldErrors.avatar) {
          if (Array.isArray(fieldErrors.avatar)) {
            errorMessage = fieldErrors.avatar[0];
          } else {
            errorMessage = fieldErrors.avatar;
          }
        }
        else if (fieldErrors.non_field_errors) {
          if (Array.isArray(fieldErrors.non_field_errors)) {
            errorMessage = fieldErrors.non_field_errors[0];
          } else {
            errorMessage = fieldErrors.non_field_errors;
          }
        }
        else {
          errorMessage = error.message || 'Profile update failed';
        }
        
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: error.message || 'Profile update failed' };
    }
  };

  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await apiService.changePassword(oldPassword, newPassword, confirmPassword);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.fieldErrors) {
        const fieldErrors = error.fieldErrors;
        let errorMessage = '';
        
        if (fieldErrors.old_password) {
          if (Array.isArray(fieldErrors.old_password)) {
            errorMessage = fieldErrors.old_password[0];
          } else {
            errorMessage = fieldErrors.old_password;
          }
        }
        else if (fieldErrors.new_password) {
          if (Array.isArray(fieldErrors.new_password)) {
            errorMessage = fieldErrors.new_password[0];
          } else {
            errorMessage = fieldErrors.new_password;
          }
        }
        else if (fieldErrors.confirm_password) {
          if (Array.isArray(fieldErrors.confirm_password)) {
            errorMessage = fieldErrors.confirm_password[0];
          } else {
            errorMessage = fieldErrors.confirm_password;
          }
        }
        else if (fieldErrors.non_field_errors) {
          if (Array.isArray(fieldErrors.non_field_errors)) {
            errorMessage = fieldErrors.non_field_errors[0];
          } else {
            errorMessage = fieldErrors.non_field_errors;
          }
        }
        else {
          errorMessage = error.message || 'Password change failed';
        }
        
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: error.message || 'Password change failed' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      authChecked,
      login,
      signup,
      logout,
      refreshToken,
      checkAuth,
      updateProfile,
      changePassword
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
