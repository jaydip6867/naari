import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';

const Order = ({ onLogout }) => {
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
          <h1 className="page-title">Order Management</h1>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Orders</h2>
            <button className="add-btn">+ Add Order</button>
          </div>

          <div className="order-list">
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
              No orders found
              <div style={{ marginTop: '16px' }}>
                <button className="add-btn">
                  + Add Your First Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
