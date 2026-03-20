import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = storage.getUser();
  const permissions = storage.getPermissions();

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
          <h1 className="page-title">Dashboard</h1>
        </div>

        <div className="content-section">
          <h2 className="section-title">Welcome, {user?.fullName || 'User'}!</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <p><strong>User ID:</strong> {user?.userId}</p>
            <p><strong>Role:</strong> {storage.getUserRole()}</p>
            <p><strong>Status:</strong> {user?.status ? 'Active' : 'Inactive'}</p>
          </div>

          <div className="section-title">Your Permissions</div>
          {permissions && permissions.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {permissions.map((permission, index) => (
                <div key={index} style={{ 
                  padding: '16px', 
                  background: 'var(--background-light)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
                    {permission.displayname}
                  </h4>
                  <div style={{ fontSize: '14px', color: 'var(--gray-color)' }}>
                    <div>👁️ View: {permission.view ? '✅' : '❌'}</div>
                    <div>✏️ Add/Edit: {permission.insertUpdate ? '✅' : '❌'}</div>
                    <div>🗑️ Delete: {permission.delete ? '✅' : '❌'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No permissions available</p>
          )}

          <div style={{ marginTop: '24px' }}>
            <h3 className="section-title">Quick Actions</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {storage.hasPermission('orders', 'view') && (
                <button 
                  className="add-btn"
                  onClick={() => console.log('Navigate to orders')}
                >
                  View Orders
                </button>
              )}
              {storage.hasPermission('users', 'insertUpdate') && (
                <button 
                  className="add-btn"
                  onClick={() => console.log('Navigate to users')}
                >
                  Manage Users
                </button>
              )}
              {storage.hasPermission('measurements', 'view') && (
                <button 
                  className="add-btn"
                  onClick={() => navigate('/settings')}
                >
                  Manage Measurements
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
