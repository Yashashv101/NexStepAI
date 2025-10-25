import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage)
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData, token) => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
      
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;