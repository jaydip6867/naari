import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.js';
import Settings from './components/Settings.js';
import Dashboard from './components/Dashboard.js';
import './styles.css';
import { storage } from './utils/storage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load and page refresh
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuthenticated = storage.isAuthenticated();
      setIsLoggedIn(isAuthenticated);
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    storage.clearAuthData();
    setIsLoggedIn(false);
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'var(--font-primary)',
        fontSize: '16px',
        color: 'var(--primary-color)'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              isLoggedIn ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isLoggedIn ? 
                <Dashboard onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/settings" 
            element={
              isLoggedIn ? 
                <Settings onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
