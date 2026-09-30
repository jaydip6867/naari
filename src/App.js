import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.js';
import Settings from './components/Settings.js';
import Dashboard from './components/Dashboard.js';
import Customer from './components/Customer.js';
import AddEditCustomer from './components/AddEditCustomer.js';
import ViewCustomer from './components/ViewCustomer.js';
import Order from './components/Order.js';
import Team from './components/Team.js';
import Tasks from './components/Tasks.js';
import TaskDetail from './components/TaskDetail.js';
import Product from './components/Product.js';
import AddEditProduct from './components/AddEditProduct.js';
import ViewProduct from './components/ViewProduct.js';
import AddEditOrder from './components/AddEditOrder.js';
import ViewOrder from './components/ViewOrder.js';
import Chat from './components/Chat.js';
import ExpenseAlert from './components/ExpenseAlert.js';
import Reports from './components/Reports.js';
import './styles.css';
import { storage } from './utils/storage';
import { LoadingProvider } from './contexts/LoadingContext.js';
import Invoice from './components/Invoice.js';
import CalendarPage from './components/CalendarPage.js';
import Home from './components/Home.js';
import About from './components/About.js';
import PublicProduct from './components/PublicProduct.js';
import ProductDetail from './components/ProductDetail.js';
import Contact from './components/Contact.js';
import Leads from './components/Leads.js';


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

const ProtectedRoute = ({ isLoggedIn, children }) => (
  isLoggedIn ? children : <Navigate to="/login" replace />
);

const AdminRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return storage.isAdmin() ? children : <Navigate to="/dashboard" replace />;
};

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
      <LoadingProvider>
        <Router>
          <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/product" element={<PublicProduct />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />

            <Route path="/dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Dashboard onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Settings onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Customer onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/customers/add" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditCustomer onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/customers/edit/:customerId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditCustomer onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/customers/view/:customerId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ViewCustomer onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Order onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/orders/add" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditOrder onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/orders/edit/:orderId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditOrder onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/orders/view/:orderId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ViewOrder onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Team onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/leads" element={<AdminRoute isLoggedIn={isLoggedIn}><Leads onLogout={handleLogout} /></AdminRoute>} />
            <Route path="/tasks" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Tasks onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/tasks/:orderId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><TaskDetail onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Product onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/products/add" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditProduct onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/products/edit/:productId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditProduct onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/products/view/:productId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ViewProduct onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Chat onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/alert" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ExpenseAlert onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Reports onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/invoice" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Invoice onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CalendarPage onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </Router>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
