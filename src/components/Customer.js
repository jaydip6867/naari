import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';

const Customer = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  return (
    <div className="settings-container">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Customer Management</h1>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Customers</h2>
            <button className="add-btn">+ Add Customer</button>
          </div>

          <div className="customer-list">
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
              No customers found
              <div style={{ marginTop: '16px' }}>
                <button className="add-btn">
                  + Add Your First Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customer;
