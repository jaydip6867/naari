import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.js';
import Settings from './components/Settings.js';
import Dashboard from './components/Dashboard.js';
import Customer from './components/Customer.js';
import AddEditCustomer from './components/AddEditCustomer.js';
import Order from './components/Order.js';
import Team from './components/Team.js';
import Tasks from './components/Tasks.js';
import Product from './components/Product.js';
import AddEditProduct from './components/AddEditProduct.js';
import ViewProduct from './components/ViewProduct.js';
import AddEditOrder from './components/AddEditOrder.js';
import ViewOrder from './components/ViewOrder.js';
import './styles.css';
import { storage } from './utils/storage';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page and try again.</p>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load and page refresh
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const isAuthenticated = storage.isAuthenticated();
        setIsLoggedIn(isAuthenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
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
        fontFamily: 'Inter, Roboto, Arial, sans-serif',
        fontSize: '16px',
        color: '#EA9D81',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #EA9D81', 
            borderRadius: '50%', 
            margin: '0 auto 20px'
          }} className="loading-spinner"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
            <Route 
              path="/customers" 
              element={
                isLoggedIn ? 
                  <Customer onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/customers/add" 
              element={
                isLoggedIn ? 
                  <AddEditCustomer onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/customers/edit/:customerId" 
              element={
                isLoggedIn ? 
                  <AddEditCustomer onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/orders" 
              element={
                isLoggedIn ? 
                  <Order onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/team" 
              element={
                isLoggedIn ? 
                  <Team onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/tasks" 
              element={
                isLoggedIn ? 
                  <Tasks onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/products" 
              element={
                isLoggedIn ? 
                  <Product onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/products/add" 
              element={
                isLoggedIn ? 
                  <AddEditProduct onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/products/edit/:productId" 
              element={
                isLoggedIn ? 
                  <AddEditProduct onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/products/view/:productId" 
              element={
                isLoggedIn ? 
                  <ViewProduct onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/orders/add" 
              element={
                isLoggedIn ? 
                  <AddEditOrder onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/orders/edit/:orderId" 
              element={
                isLoggedIn ? 
                  <AddEditOrder onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/orders/view/:orderId" 
              element={
                isLoggedIn ? 
                  <ViewOrder onLogout={handleLogout} /> : 
                  <Navigate to="/" replace />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
