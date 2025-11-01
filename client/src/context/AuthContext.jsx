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
      // Use the role provided by the server response
      const userWithRole = {
        ...userData,
        role: userData.role || 'user' // Fallback to 'user' if role is not provided
      };
      
      setUser(userWithRole);
      setIsAuthenticated(true);
      
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userWithRole));
      localStorage.setItem('token', token);
      
      console.log('User logged in with role:', userWithRole.role);
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Login failed. Please try again.');
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